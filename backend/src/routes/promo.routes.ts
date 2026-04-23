import express from "express";
import {
  sendPromoToUser,
  sendPromoToAllUsers,
  getPromoTemplates,
} from "../controllers/promo.controller";
import { adminMiddleware } from "../middleware/admin";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Public route - get promo email templates
router.get("/templates", getPromoTemplates);

// Admin routes
router.post("/send-to-user", authMiddleware, adminMiddleware, sendPromoToUser);
router.post(
  "/send-to-all",
  authMiddleware,
  adminMiddleware,
  sendPromoToAllUsers
);

export default router;
