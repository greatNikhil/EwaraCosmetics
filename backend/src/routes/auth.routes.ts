import { Router } from "express";
import {
  sendOTP,
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  forgotPasswordSendOTP,
  resetPassword,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimit";
import { validateProfileRequest } from "../middleware/validation";

const router = Router();
const otpRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 3,
  message: "Too many OTP requests. Please try again later.",
});
const loginRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: "Too many login attempts. Please try again later.",
});
const resetRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 4,
  message: "Too many password reset attempts. Please try again later.",
});

router.post("/send-otp", otpRateLimit, sendOTP);
router.post("/register", register);
router.post("/login", loginRateLimit, login);
router.post("/google", loginRateLimit, googleLogin);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, validateProfileRequest, updateProfile);

// Forgot password
router.post("/forgot-password/send-otp", otpRateLimit, forgotPasswordSendOTP);
router.post("/reset-password", resetRateLimit, resetPassword);

export default router;
