import { Request, Response } from "express";
import Product from "../models/Product";
import Review from "../models/review";
import User from "../models/user";

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

const recalculateProductReviews = async (productId: number) => {
  const [totalReviews, totalRating] = await Promise.all([
    Review.count({ where: { product: productId } }),
    Review.sum("rating", { where: { product: productId } }),
  ]);

  await Product.update(
    {
      rating:
        totalReviews > 0
          ? Number((Number(totalRating || 0) / totalReviews).toFixed(1))
          : 0,
      numReviews: totalReviews,
    },
    {
      where: { id: productId },
    }
  );
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (!productId || Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByPk(productId, {
      attributes: ["id", "name"],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = await Review.findAll({
      where: { product: productId },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "rating", "comment", "user", "createdAt", "updatedAt"],
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews: reviews.map((review) => serializeModel(review)),
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
    const productId = Number(req.params.id);
    const { rating, comment } = req.body;
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!productId || Number.isNaN(productId)) {
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
      Product.findByPk(productId, {
        attributes: ["id", "isPublished"],
      }),
      User.findByPk(userId, {
        attributes: ["id", "name"],
      }),
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

    let review = await Review.findOne({
      where: { product: productId, user: userId },
    });

    if (review) {
      await review.update({
        name: user.name || "Customer",
        rating: parsedRating,
        comment: String(comment).trim(),
      });
    } else {
      review = await Review.create({
        product: productId,
        user: userId,
        name: user.name || "Customer",
        rating: parsedRating,
        comment: String(comment).trim(),
      });
    }

    await recalculateProductReviews(productId);

    return res.status(200).json({
      success: true,
      message: "Review saved successfully",
      review: serializeModel(review),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save review",
    });
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      order: [["createdAt", "DESC"]],
    });

    const productIds = Array.from(new Set(reviews.map((review) => review.product)));
    const userIds = Array.from(new Set(reviews.map((review) => review.user)));
    const [products, users] = await Promise.all([
      productIds.length
        ? Product.findAll({
            where: { id: productIds },
            attributes: ["id", "name", "slug"],
          })
        : [],
      userIds.length
        ? User.findAll({
            where: { id: userIds },
            attributes: ["id", "name", "email"],
          })
        : [],
    ]);

    const productMap = new Map(products.map((product) => [product.id, product]));
    const userMap = new Map(users.map((user) => [user.id, user]));

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews: reviews.map((review) => ({
        ...serializeModel(review),
        product: productMap.get(review.product)
          ? serializeModel(productMap.get(review.product)!)
          : review.product,
        user: userMap.get(review.user)
          ? serializeModel(userMap.get(review.user)!)
          : review.user,
      })),
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
    const reviewId = Number(req.params.id);

    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product;
    await review.destroy();
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
