import { Router } from "express";
import {
  getAllUsers,
  getDashboardSummary,
  updateUserRole,
} from "../controllers/admin.controller";
import { deleteReview, getAllReviews } from "../controllers/review.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import {
  validateAdminUserRoleRequest,
  validateObjectIdParam,
} from "../middleware/validation";

const router = Router();

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardSummary);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/reviews", authMiddleware, adminMiddleware, getAllReviews);
router.put(
  "/users/:id/role",
  authMiddleware,
  adminMiddleware,
  validateObjectIdParam(),
  validateAdminUserRoleRequest,
  updateUserRole
);
router.delete(
  "/reviews/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectIdParam(),
  deleteReview
);

export default router;
