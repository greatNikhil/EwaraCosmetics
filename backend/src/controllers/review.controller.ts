import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Review from "../models/review";
import User from "../models/user";

const recalculateProductReviews = async (productId: string) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const reviewStats = stats[0];

  await Product.findByIdAndUpdate(productId, {
    rating: reviewStats ? Number(reviewStats.averageRating.toFixed(1)) : 0,
    numReviews: reviewStats ? reviewStats.totalReviews : 0,
  });
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).select("_id name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = await Review.find({ product: id })
      .sort({ createdAt: -1 })
      .select("name rating comment user createdAt updatedAt");

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

export const createOrUpdateReview = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const parsedRating = Number(rating);

    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    const [product, user] = await Promise.all([
      Product.findById(id).select("_id isPublished"),
      User.findById(userId).select("name"),
    ]);

    if (!product || !product.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const review = await Review.findOneAndUpdate(
      { product: id, user: userId },
      {
        product: id,
        user: userId,
        name: user.name || "Customer",
        rating: parsedRating,
        comment: String(comment).trim(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await recalculateProductReviews(id);

    return res.status(200).json({
      success: true,
      message: "Review saved successfully",
      review,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save review",
    });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name slug")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product.toString();

    await Review.findByIdAndDelete(id);
    await recalculateProductReviews(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review",
    });
  }
};
