import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { WishlistItem } from "../models/WishlistItem";
import mongoose from "mongoose";

const router = Router();

// ============================================
// 1. GET ALL WISHLIST ITEMS FOR USER
// ============================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const wishlist = await WishlistItem.find({ userId }).sort({
      addedAt: -1,
    });

    res.json({
      success: true,
      wishlist,
      count: wishlist.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 2. ADD ITEM TO WISHLIST
// ============================================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, productName, price, image, category } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!productId || !productName || !price || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId, productName, price, image, category",
      });
    }

    // Check if already in wishlist
    const existing = await WishlistItem.findOne({
      userId,
      productId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist",
        item: existing,
      });
    }

    // Create new wishlist item
    const item = new WishlistItem({
      userId,
      productId,
      productName,
      price,
      image,
      category,
    });

    const savedItem = await item.save();

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      item: savedItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 3. REMOVE ITEM FROM WISHLIST
// ============================================
router.delete("/:itemId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // Verify ownership and delete
    const result = await WishlistItem.findOneAndDelete({
      _id: itemId,
      userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    res.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 4. REMOVE ITEM BY PRODUCT ID
// ============================================
router.delete("/product/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Delete by product ID
    const result = await WishlistItem.findOneAndDelete({
      userId,
      productId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    res.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 5. CHECK IF PRODUCT IS IN WISHLIST
// ============================================
router.get("/check/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const exists = await WishlistItem.findOne({
      userId,
      productId,
    });

    res.json({
      success: true,
      inWishlist: !!exists,
      item: exists || null,
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 6. CLEAR ALL WISHLIST ITEMS
// ============================================
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await WishlistItem.deleteMany({ userId });

    res.json({
      success: true,
      message: "Wishlist cleared",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
