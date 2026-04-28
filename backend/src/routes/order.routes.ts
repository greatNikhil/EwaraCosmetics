import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  notifyPaymentFailure,
  updatePaymentStatus,
  updateOrderStatus,
} from "../controllers/order.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Create new order
router.post("/", authMiddleware, createOrder);
router.post("/payment-failure", authMiddleware, notifyPaymentFailure);

// Logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);

// Admin all orders
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

// Single order by ID
router.get("/:id", authMiddleware, getOrderById);

// Admin update status
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.put(
  "/:id/payment-status",
  authMiddleware,
  adminMiddleware,
  updatePaymentStatus
);

export default router;
