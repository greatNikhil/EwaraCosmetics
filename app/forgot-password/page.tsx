"use client";

import { useState } from "react";
import { buildApiUrl } from "@/utils/api";

const phoneOtpEnabled = process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED === "true";
const isPhoneIdentifier = (value: string) => /^[6-9]\d{9}$/.test(value.trim());

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const sendOTP = async () => {
    if (isPhoneIdentifier(identifier) && !phoneOtpEnabled) {
      alert("Phone OTP will be available soon. Please use your email address for password reset.");
      return;
    }

    const res = await fetch(buildApiUrl("/api/auth/forgot-password/send-otp"), {
      method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("OTP sent");
    setStep(2);
  };

  const resetPassword = async () => {
    const res = await fetch(buildApiUrl("/api/auth/reset-password"), {
      method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Password reset successful");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f6]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[350px]">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder={phoneOtpEnabled ? "Enter email or phone" : "Enter email"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />

            <button
              onClick={sendOTP}
              className="w-full bg-[#7a1f2b] text-white py-2 rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />

            <button
              onClick={resetPassword}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
