import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/coupon.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import {
  validateAdminCouponRequest,
  validateCouponRequest,
  validateObjectIdParam,
} from "../middleware/validation";
import { createRateLimiter } from "../middleware/rateLimit";

const router = Router();
const couponValidationRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  message: "Too many coupon validation attempts. Please try again later.",
});

router.post(
  "/validate",
  couponValidationRateLimit,
  validateCouponRequest,
  validateCoupon
);
router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateAdminCouponRequest,
  createCoupon
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectIdParam(),
  validateAdminCouponRequest,
  updateCoupon
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectIdParam(),
  deleteCoupon
);

export default router;
