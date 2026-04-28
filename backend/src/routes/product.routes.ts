import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import {
  createOrUpdateReview,
  getProductReviews,
} from "../controllers/review.controller";
import authMiddleware from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import {
  validateObjectIdParam,
  validateProductRequest,
  validateReviewRequest,
} from "../middleware/validation";

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', validateObjectIdParam(), getProductById);
router.get("/:id/reviews", validateObjectIdParam(), getProductReviews);
router.post(
  "/:id/reviews",
  authMiddleware,
  validateObjectIdParam(),
  validateReviewRequest,
  createOrUpdateReview
);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, validateProductRequest, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, validateObjectIdParam(), validateProductRequest, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, validateObjectIdParam(), deleteProduct);

export default router;
