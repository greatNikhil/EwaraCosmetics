import { Router } from "express";
import {
  createReturnRequest,
  getMyReturnRequests,
  getReturnRequestById,
  updateReturnStatus,
  getAllReturnRequests,
} from "../controllers/return.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Customer routes
router.post("/", authMiddleware, createReturnRequest);
router.get("/my", authMiddleware, getMyReturnRequests);
router.get("/:id", authMiddleware, getReturnRequestById);

// Admin routes
router.put("/:id/status", authMiddleware, adminMiddleware, updateReturnStatus);
router.get("/", authMiddleware, adminMiddleware, getAllReturnRequests);

export default router;
