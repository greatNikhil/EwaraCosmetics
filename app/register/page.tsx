"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/utils/api";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpChannel, setOtpChannel] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

  const validateForm = () => {
    const e: Record<string, string> = {};

    if (!formData.name.trim()) e.name = "Name required";

    if (!validateEmail(formData.email)) e.email = "Valid email required";

    if (!validatePhone(formData.phone)) e.phone = "Valid phone required";

    if (formData.password.length < 6) e.password = "Min 6 characters";

    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    if (otpSent && !formData.otp.trim()) e.otp = "OTP required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSendOTP = async () => {
    if (otpChannel === "email" && !validateEmail(formData.email)) {
      setErrors({ email: "Enter valid email first" });
      return;
    }

    if (otpChannel === "phone" && !validatePhone(formData.phone)) {
      setErrors({ phone: "Enter valid phone first" });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(buildApiUrl("/api/auth/send-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          otpChannel === "email" ? { email: formData.email } : { phone: formData.phone }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ email: data.message });
        return;
      }

      setOtpSent(true);
      alert("OTP sent successfully");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await fetch(buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          otp: formData.otp,
          otpChannel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Account created");

      router.push("/login");
    } catch {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const nameParts = formData.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  const updateNameParts = (nextFirst: string, nextLast: string) => {
    handleChange("name", `${nextFirst}${nextFirst && nextLast ? " " : ""}${nextLast}`.trim());
  };

  const passwordStrength =
    formData.password.length < 6
      ? "weak"
      : formData.password.length < 10
        ? "medium"
        : "strong";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ede8e0] px-4 py-8">
      <div className="mx-auto w-full max-w-[420px] rounded-[18px] border border-[#e8d8d0] bg-[#fdf8f6] px-7 py-8">
        <div className="mx-auto mb-5 w-fit rounded-[6px] bg-[#7B2D42] px-[14px] py-[5px] text-center text-[12px] tracking-[0.1em] text-white">
          E W A R A
        </div>

        <h1 className="text-center text-[22px] font-medium text-[#3a1a22]">
          Create Account
        </h1>
        <p className="mt-2 text-center text-[12px] text-[#a07080]">
          Join Ewara and verify via email or phone to get started
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Send OTP to
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOtpChannel("email")}
                className={`flex-1 rounded-[10px] border px-3 py-2 text-[12px] transition ${
                  otpChannel === "email"
                    ? "border-[#7B2D42] bg-[#7B2D42] text-white"
                    : "border-[#f0dde2] bg-[#f9eef2] text-[#3a1a22]"
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => setOtpChannel("phone")}
                className={`flex-1 rounded-[10px] border px-3 py-2 text-[12px] transition ${
                  otpChannel === "phone"
                    ? "border-[#7B2D42] bg-[#7B2D42] text-white"
                    : "border-[#f0dde2] bg-[#f9eef2] text-[#3a1a22]"
                }`}
              >
                Phone OTP
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
                First Name
              </label>
              <input
                placeholder="First name"
                value={firstName}
                onChange={(e) => updateNameParts(e.target.value, lastName)}
                className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
                Last Name
              </label>
              <input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => updateNameParts(firstName, e.target.value)}
                className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
              />
            </div>
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Email
            </label>
            <input
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Phone
            </label>
            <input
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
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
                  alt="toggle password"
                  width={18}
                  height={18}
                />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <span
                className={`h-[3px] flex-1 rounded-[3px] ${
                  passwordStrength === "weak" ? "bg-[#e24b4a]" : "bg-[#ead9df]"
                }`}
              />
              <span
                className={`h-[3px] flex-1 rounded-[3px] ${
                  passwordStrength === "medium" || passwordStrength === "strong"
                    ? "bg-[#ef9f27]"
                    : "bg-[#ead9df]"
                }`}
              />
              <span
                className={`h-[3px] flex-1 rounded-[3px] ${
                  passwordStrength === "strong" ? "bg-[#3B6D11]" : "bg-[#ead9df]"
                }`}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#a07080]">
              Password strength: {passwordStrength}
            </p>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] pr-11 text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image
                  src={
                    showConfirmPassword
                      ? "/favicon/eye-close.png"
                      : "/favicon/eye-open.png"
                  }
                  alt="toggle confirm password"
                  width={18}
                  height={18}
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {otpSent && (
            <div>
              <label className="mb-[5px] block text-[11px] font-medium tracking-[0.03em] text-[#7B2D42]">
                OTP
              </label>
              <input
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(e) => handleChange("otp", e.target.value)}
                className="w-full rounded-[10px] border border-[#f0dde2] bg-[#f9eef2] px-[14px] py-[10px] text-[13px] text-[#3a1a22] outline-none placeholder:text-[#c0a8b0] focus:border-[#7B2D42] focus:bg-white"
              />
              {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
            </div>
          )}

          <label className="flex items-start gap-2 text-[11px] text-[#a07080]">
            <input type="checkbox" className="mt-0.5" />
            <span>
              I agree to the{" "}
              <span className="text-[#7B2D42]">Terms of Service</span> and{" "}
              <span className="text-[#7B2D42]">Privacy Policy</span>
            </span>
          </label>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOTP}
              className="w-full rounded-[30px] bg-[#c49a6c] px-4 py-3 text-[14px] text-white transition hover:bg-[#b08860]"
            >
              {loading
                ? "Sending..."
                : otpChannel === "email"
                  ? "Send Email OTP"
                  : "Send Phone OTP"}
            </button>
          ) : (
            <button
              type="submit"
              className="w-full rounded-[30px] bg-[#7B2D42] px-4 py-3 text-[14px] text-white transition hover:bg-[#6a2438]"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          )}
        </form>

        <p className="mt-5 text-center text-[12px] text-[#a07080]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#7B2D42]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
