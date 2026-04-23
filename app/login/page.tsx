"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const res = await fetch("http://localhost:5000/api/auth/login", {
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");

      window.dispatchEvent(new Event("userChanged"));

      // 🔥 role-based redirect
      if (data.user.role === "admin") {
        localStorage.setItem("isAdmin", "true");
        router.push("/admin");
      } else {
        localStorage.removeItem("isAdmin");
        router.push("/profile");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3ede7] px-4">
      <div className="w-full max-w-md bg-[#fffaf7] border border-[#ead2d8] rounded-2xl p-8 shadow-xl">

        <h1 className="text-xl font-semibold text-center text-[#4a2c2a] mb-6">
          Welcome Back 💄
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm text-[#5a4f4d] mb-1">
              Email
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea] border border-[#ead2d8] outline-none focus:ring-2 focus:ring-[#d4a373]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-[#5a4f4d] mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 pr-10 rounded-lg bg-[#f7e7ea] border border-[#ead2d8] outline-none focus:ring-2 focus:ring-[#d4a373]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
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

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-[#7a1f2b] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-full bg-[#7a1f2b] text-white font-medium hover:bg-[#5c1721] transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="text-sm text-center text-[#5a4f4d] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#7a1f2b] font-medium">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}