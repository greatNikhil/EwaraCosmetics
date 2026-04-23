import authMiddleware from "../middleware/auth";
import adminMiddleware from "../middleware/admin";
import { Router } from "express";
import {
  sendOTP,
  register,
  login,
  getMe,
  forgotPasswordSendOTP,
  resetPassword,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth";

const router = Router();

router.post("/send-otp", sendOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

// Forgot password
router.post("/forgot-password/send-otp", forgotPasswordSendOTP);
router.post("/reset-password", resetPassword);

export default router;