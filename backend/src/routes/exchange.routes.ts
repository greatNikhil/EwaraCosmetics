import { Router } from "express";
import {
  createExchangeRequest,
  getMyExchangeRequests,
  getExchangeRequestById,
  updateExchangeStatus,
  getAllExchangeRequests,
} from "../controllers/exchange.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Customer routes
router.post("/", authMiddleware, createExchangeRequest);
router.get("/my", authMiddleware, getMyExchangeRequests);
router.get("/:id", authMiddleware, getExchangeRequestById);

// Admin routes
router.put("/:id/status", authMiddleware, adminMiddleware, updateExchangeStatus);
router.get("/", authMiddleware, adminMiddleware, getAllExchangeRequests);

export default router;
