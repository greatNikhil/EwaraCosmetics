import { Router } from "express";
import {
  sendOTP,
  register,
  login,
  getMe,
  forgotPasswordSendOTP,
  resetPassword,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

router.post("/send-otp", sendOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

router.post("/forgot-password/send-otp", forgotPasswordSendOTP);
router.post("/reset-password", resetPassword);

router.get(
  "/admin-check",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

export default router;