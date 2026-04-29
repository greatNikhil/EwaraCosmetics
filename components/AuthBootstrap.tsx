"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { buildApiUrl } from "@/utils/api";
import { clearClientAuth, persistClientAuth } from "@/utils/clientAuth";
import { syncWishlistFromBackend } from "@/utils/wishlist";

export function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setAddresses = useAuthStore((state) => state.setAddresses);
  const syncCartFromBackend = useCartStore((state) => state.syncFromBackend);
  const lastBootstrappedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      lastBootstrappedTokenRef.current = null;
      return;
    }

    if (lastBootstrappedTokenRef.current === token) {
      return;
    }

    let isActive = true;

    const bootstrapSession = async () => {
      try {
        const userResponse = await fetch(buildApiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.success || !userData.user) {
          clearClientAuth({ dispatchEvent: true });
          return;
        }

        persistClientAuth(userData.user, token);

        const addressesResponse = await fetch(buildApiUrl("/api/addresses"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (addressesResponse.ok) {
          const addressesData = await addressesResponse.json();
          if (isActive) {
            setAddresses(addressesData.addresses || []);
          }
        }

        await Promise.all([
          syncCartFromBackend(token),
          syncWishlistFromBackend(token),
        ]);

        if (isActive) {
          lastBootstrappedTokenRef.current = token;
          window.dispatchEvent(new Event("userChanged"));
        }
      } catch (error) {
        console.error("AUTH BOOTSTRAP ERROR:", error);
        clearClientAuth({ dispatchEvent: true });
      }
    };

    bootstrapSession();

    return () => {
      isActive = false;
    };
  }, [setAddresses, syncCartFromBackend, token]);

  return null;
}
