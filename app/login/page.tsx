"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { buildApiUrl } from "@/utils/api";
import { clearClientAuth, persistClientAuth } from "@/utils/clientAuth";
import { syncWishlistFromBackend } from "@/utils/wishlist";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, setAddresses } = useAuthStore();
  const syncCartFromBackend = useCartStore((state) => state.syncFromBackend);

  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserAddresses = async (token: string) => {
    try {
      const res = await fetch(buildApiUrl("/api/addresses"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  const hydrateUserSession = async (user: any, token: string) => {
    persistClientAuth(user, token);
    await Promise.all([
      fetchUserAddresses(token),
      syncCartFromBackend(token),
      syncWishlistFromBackend(token),
    ]);
    window.dispatchEvent(new Event("userChanged"));
  };

  const routeAfterLogin = (normalizedUser: any) => {
    if (normalizedUser.role === "admin") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin");
      return;
    }

    localStorage.removeItem("isAdmin");
    router.push("/profile");
  };

  const handleAuthSuccess = async (data: any) => {
    const normalizedUser = {
      ...data.user,
      id: data.user?._id || data.user?.id,
    };

    clearClientAuth();
    setToken(data.token);
    setUser(normalizedUser);
    await hydrateUserSession(normalizedUser, data.token);
    routeAfterLogin(normalizedUser);
  };

  const handleGoogleLogin = () => {
    const google = (window as any).google;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!google) {
      console.error("Google SDK not loaded");
      return;
    }

    if (!clientId) {
      console.error("Google client ID not configured");
      setError("Google login is not configured");
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "email profile",
      callback: async (response: any) => {
        if (!response.access_token) return;

        try {
          setError("");
          setLoading(true);

          const res = await fetch(buildApiUrl("/api/auth/google"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.access_token }),
          });

          const data = await res.json();

          if (data.success) {
            await handleAuthSuccess(data);
          } else {
            setError(data.message || "Login failed");
          }
        } catch (err) {
          console.error(
            "Google login failed:",
            err instanceof Error ? err.message : String(err)
          );
          setError("Server connection failed");
        } finally {
          setLoading(false);
        }
      },
    });

    client.requestAccessToken();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanInput = input.trim();

    if (!cleanInput || !password) {
      setError("All fields required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanInput,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      await handleAuthSuccess(data);
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ede8e0] px-4 py-8">
      <div className="mx-auto w-full max-w-[420px] rounded-[18px] border border-[#e8d8d0] bg-[#fdf8f6] px-7 py-8">
        <div className="mx-auto mb-5 w-fit rounded-[6px] bg-[#7B2D42] px-[14px] py-[5px] text-center text-[12px] tracking-[0.1em] text-white">
          E W A R A
        </div>

        <h1 className="text-center text-[22px] font-medium text-[#3a1a22]">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-[12px] text-[#a07080]">
          Sign in to continue to your Ewara account
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Email
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] pr-11 text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image
                  src={
                    showPassword
                      ? "/favicon/eye-close.png"
                      : "/favicon/eye-open.png"
                  }
                  alt="toggle"
                  width={18}
                  height={18}
                />
              </button>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[11px] text-[#7B2D42] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[30px] bg-[#7B2D42] px-4 py-3 text-[14px] font-medium text-white transition hover:bg-[#6a2438]"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-[0.5px] flex-1 bg-[#f0dde2]" />
          <span className="text-[11px] text-[#c0a8b0]">or continue with</span>
          <div className="h-[0.5px] flex-1 bg-[#f0dde2]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#f0dde2] bg-white px-4 py-[10px] text-[12px] text-[#3a1a22]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-5.9s2.7-5.9 5.9-5.9c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.6 14.5 2.8 12 2.8A9.2 9.2 0 0 0 2.8 12 9.2 9.2 0 0 0 12 21.2c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.2-1.6H12Z"
            />
            <path
              fill="#34A853"
              d="M3.9 7.3l3.2 2.3c.9-1.8 2.8-3.1 4.9-3.1 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.6 14.5 2.8 12 2.8c-3.5 0-6.6 2-8.1 4.9Z"
            />
            <path
              fill="#FBBC05"
              d="M12 21.2c2.4 0 4.5-.8 6-2.3l-2.8-2.2c-.8.6-1.8 1-3.2 1-2.5 0-4.6-1.7-5.4-4l-3.3 2.5c1.5 3 4.7 5 8.7 5Z"
            />
            <path
              fill="#4285F4"
              d="M20.8 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1 2.3-2.1 3l2.8 2.2c1.6-1.5 2.7-3.8 2.7-7.5Z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-5 text-center text-[12px] text-[#a07080]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#7B2D42]">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
