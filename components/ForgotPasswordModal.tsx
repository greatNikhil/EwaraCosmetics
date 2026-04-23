"use client";

import { useState, useEffect } from "react";
import OTPInput from "@/components/OTPInput";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "phone" | "otp" | "newPassword";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const resetModal = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setTimer(30);
    setCanResend(false);
    setIsLoading(false);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = () => {
    if (!phone.trim()) {
      setErrors({ phone: "Phone number is required" });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({ phone: "Enter a valid 10-digit phone number" });
      return;
    }

    // Check if user exists
    const userData = localStorage.getItem(`user_${phone}`);
    if (!userData) {
      setErrors({ phone: "No account found with this phone number" });
      return;
    }

    setErrors({});
    setStep("otp");
    // Mock OTP send
    alert(`OTP sent to ${phone}: 123456`);
  };

  const handleOtpComplete = (otpValue: string) => {
    setOtp(otpValue);
  };

  const handleOtpSubmit = () => {
    if (otp !== "123456") {
      setErrors({ otp: "Invalid OTP" });
      return;
    }

    setErrors({});
    setStep("newPassword");
  };

  const handlePasswordSubmit = () => {
    if (!newPassword) {
      setErrors({ newPassword: "New password is required" });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: "Please confirm your password" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    // Update password in localStorage
    const userData = JSON.parse(localStorage.getItem(`user_${phone}`) || "{}");
    userData.password = newPassword;

    localStorage.setItem(`user_${phone}`, JSON.stringify(userData));

    // Also update email key if it exists
    if (userData.email) {
      localStorage.setItem(`user_${userData.email}`, JSON.stringify(userData));
    }

    setIsLoading(false);
    onSuccess();
    onClose();
    alert("Password updated successfully!");
  };

  const handleResendOtp = () => {
    setTimer(30);
    setCanResend(false);
    alert(`OTP resent to ${phone}: 123456`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-[#fffaf7] border border-[#ead2d8] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5a4f4d] hover:text-[#7a1f2b] transition"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[#4a2c2a]">
            Forgot Password
          </h2>
          <p className="text-[#5a4f4d] text-sm mt-1">
            {step === "phone" && "Enter your registered phone number"}
            {step === "otp" && "Enter the OTP sent to your phone"}
            {step === "newPassword" && "Create a new password"}
          </p>
        </div>

        {/* STEP 1: PHONE INPUT */}
        {step === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#5a4f4d] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors({});
                }}
                maxLength={10}
                className="w-full px-4 py-3 rounded-lg bg-[#f7e7ea] border border-[#ead2d8] outline-none focus:ring-2 focus:ring-[#d4a373]"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <button
              onClick={handlePhoneSubmit}
              className="w-full py-3 rounded-full bg-[#7a1f2b] text-white font-medium hover:bg-[#5c1721] hover:scale-105 transition duration-300"
            >
              Send OTP
            </button>
          </div>
        )}

        {/* STEP 2: OTP INPUT */}
        {step === "otp" && (
          <div className="space-y-4">
            <OTPInput length={6} onComplete={handleOtpComplete} />
            {errors.otp && (
              <p className="text-red-500 text-xs text-center mt-2">
                {errors.otp}
              </p>
            )}

            <div className="text-center text-sm text-[#5a4f4d]">
              {!canResend ? (
                <span>Resend OTP in {timer}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-[#7a1f2b] font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={handleOtpSubmit}
              className="w-full py-3 rounded-full bg-[#7a1f2b] text-white font-medium hover:bg-[#5c1721] hover:scale-105 transition duration-300"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "newPassword" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#5a4f4d] mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({});
                }}
                className="w-full px-4 py-3 rounded-lg bg-[#f7e7ea] border border-[#ead2d8] outline-none focus:ring-2 focus:ring-[#d4a373]"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-[#5a4f4d] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({});
                }}
                className="w-full px-4 py-3 rounded-lg bg-[#f7e7ea] border border-[#ead2d8] outline-none focus:ring-2 focus:ring-[#d4a373]"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#7a1f2b] text-white font-medium hover:bg-[#5c1721] hover:scale-105 transition duration-300 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
