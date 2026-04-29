"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/utils/api";
import {
  clearClientAuth,
  getClientToken,
  persistClientAuth,
} from "@/utils/clientAuth";

interface ProtectedUser {
  _id?: string;
  id?: string;
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface UseProtectedRouteOptions {
  requireAdmin?: boolean;
}

interface AuthMeResponse {
  success?: boolean;
  user?: ProtectedUser;
}

export function useProtectedRoute(options?: UseProtectedRouteOptions) {
  const requireAdmin = options?.requireAdmin ?? false;
  const router = useRouter();

  const [user, setUser] = useState<ProtectedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("userChanged", handleRefresh);
    window.addEventListener("storage", handleRefresh);

    return () => {
      window.removeEventListener("userChanged", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const verifyUser = async () => {
      const storedToken = getClientToken();

      if (!storedToken) {
        clearClientAuth();

        if (isActive) {
          setUser(null);
          setToken(null);
          setIsAuthorized(false);
          setIsChecking(false);
        }

        router.replace("/login");
        return;
      }

      if (isActive) {
        setToken(storedToken);
        setIsChecking(true);
      }

      try {
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const data: AuthMeResponse = await res.json();

        if (!res.ok || !data.success || !data.user) {
          clearClientAuth();

          if (isActive) {
            setUser(null);
            setIsAuthorized(false);
            setIsChecking(false);
          }

          router.replace("/login");
          return;
        }

        if (requireAdmin && data.user.role !== "admin") {
          clearClientAuth({ dispatchEvent: true });

          if (isActive) {
            setUser(null);
            setIsAuthorized(false);
            setIsChecking(false);
          }

          router.replace("/");
          return;
        }

        persistClientAuth(data.user, storedToken);

        if (isActive) {
          setUser(data.user);
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error("PROTECTED ROUTE VERIFY ERROR:", error);
        clearClientAuth();

        if (isActive) {
          setUser(null);
          setIsAuthorized(false);
          setIsChecking(false);
        }

        router.replace("/login");
      }
    };

    verifyUser();

    return () => {
      isActive = false;
    };
  }, [refreshKey, requireAdmin, router]);

  return {
    user,
    token,
    isAuthorized,
    isChecking,
  };
}
