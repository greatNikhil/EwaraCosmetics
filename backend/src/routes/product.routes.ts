import { Router } from 'express';
import fs from "fs";
import path from "path";
import multer from "multer";
import { NextFunction, Request, Response } from "express";
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
const productUploadDir = path.resolve(
  process.cwd(),
  "..",
  "public",
  "uploads",
  "products"
);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

fs.mkdirSync(productUploadDir, { recursive: true });

const productImageStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, productUploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = allowedImageExtensions.has(extension)
      ? extension
      : ".jpg";
    const safeName = path
      .basename(file.originalname || "product", extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "product";

    callback(null, `${safeName}-${Date.now()}${safeExtension}`);
  },
});

const productImageUpload = multer({
  storage: productImageStorage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (file.mimetype.startsWith("image/") && allowedImageExtensions.has(extension)) {
      callback(null, true);
      return;
    }

    callback(new Error("Only JPG, PNG, and WEBP image uploads are allowed."));
  },
});

const handleProductImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  productImageUpload.array("images", 8)(req, res, (error: any) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to upload product images.",
      });
    }

    next();
  });
};

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
router.post(
  "/uploads/images",
  authMiddleware,
  adminMiddleware,
  handleProductImageUpload,
  (req: any, res) => {
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one product image.",
      });
    }

    return res.status(201).json({
      success: true,
      images: files.map((file: Express.Multer.File) => `/uploads/products/${file.filename}`),
    });
  }
);
router.post('/', authMiddleware, adminMiddleware, validateProductRequest, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, validateObjectIdParam(), validateProductRequest, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, validateObjectIdParam(), deleteProduct);

export default router;
