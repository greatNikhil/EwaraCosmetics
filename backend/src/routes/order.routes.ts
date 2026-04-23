import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Create new order
router.post("/", authMiddleware, createOrder);

// Logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);

// Admin all orders
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

// Single order by ID
router.get("/:id", authMiddleware, getOrderById);

// Admin update status
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;