import { Router } from "express";
import {
  requestRefund,
  getMyRefundRequests,
  getRefundRequestById,
  cancelRefundRequest,
  getAllRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
  processApprovedRefund,
} from "../controllers/refundRequest.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// User routes
router.post("/", authMiddleware, requestRefund);
router.get("/my", authMiddleware, getMyRefundRequests);
router.get("/:id", authMiddleware, getRefundRequestById);
router.put("/:id/cancel", authMiddleware, cancelRefundRequest);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllRefundRequests);
router.put("/:id/approve", authMiddleware, adminMiddleware, approveRefundRequest);
router.put("/:id/reject", authMiddleware, adminMiddleware, rejectRefundRequest);
router.put("/:id/process", authMiddleware, adminMiddleware, processApprovedRefund);

export default router;
