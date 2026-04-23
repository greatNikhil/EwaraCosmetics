import express from "express";
import {
  sendPromoToUser,
  sendPromoToAllUsers,
  getPromoTemplates,
} from "../controllers/promo.controller";
import { adminMiddleware } from "../middleware/admin";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Public route - get promo email templates
router.get("/templates", getPromoTemplates);

// Admin routes
router.post("/send-to-user", authenticateToken, adminMiddleware, sendPromoToUser);
router.post(
  "/send-to-all",
  authenticateToken,
  adminMiddleware,
  sendPromoToAllUsers
);

export default router;
