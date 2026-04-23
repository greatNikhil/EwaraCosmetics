"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) =>
    /^[6-9]\d{9}$/.test(phone);

  const validateForm = () => {
    const e: Record<string, string> = {};

    if (!formData.name.trim()) e.name = "Name required";

    if (!validateEmail(formData.email))
      e.email = "Valid email required";

    if (!validatePhone(formData.phone))
      e.phone = "Valid phone required";

    if (formData.password.length < 6)
      e.password = "Min 6 characters";

    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    if (otpSent && !formData.otp.trim())
      e.otp = "OTP required";

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

  // SEND OTP
  const handleSendOTP = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ email: "Enter valid email first" });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

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

  // REGISTER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
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
          }),
        }
      );

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3ede7] px-4 py-8">
      <div className="w-full max-w-md bg-[#fffaf7] border border-[#ead2d8] rounded-2xl p-8">

        <h1 className="text-2xl font-semibold text-center text-[#4a2c2a] mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              handleChange("name", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea]"
          />

          <input
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea]"
          />

          <input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              handleChange("phone", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea]"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              handleChange("password", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea]"
          />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleChange(
                "confirmPassword",
                e.target.value
              )
            }
            className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea]"
          />

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOTP}
              className="w-full py-3 rounded-full bg-[#d4a373] text-white"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(e) =>
                  handleChange("otp", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-[#f7e7ea]"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#7a1f2b] text-white"
              >
                {loading
                  ? "Creating..."
                  : "Create Account"}
              </button>
            </>
          )}
        </form>

        <p className="text-sm text-center mt-6">
          Already have account?{" "}
          <Link
            href="/login"
            className="text-[#7a1f2b]"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}