import { Router } from "express";
import {
  processRefund,
  completeRefund,
  getRefundById,
  getMyRefunds,
  getAllRefunds,
  failRefund,
  sendRefundNotificationManual,
} from "../controllers/refund.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Customer routes
router.get("/my", authMiddleware, getMyRefunds);
router.get("/:id", authMiddleware, getRefundById);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, processRefund);
router.put("/:id/complete", authMiddleware, adminMiddleware, completeRefund);
router.put("/:id/fail", authMiddleware, adminMiddleware, failRefund);
router.put("/:id/send-email", authMiddleware, adminMiddleware, sendRefundNotificationManual);
router.get("/", authMiddleware, adminMiddleware, getAllRefunds);

export default router;
