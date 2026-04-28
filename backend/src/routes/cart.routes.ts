import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { CartItem } from "../models/CartItem";
import mongoose from "mongoose";

const router = Router();

// ============================================
// 1. GET ALL CART ITEMS FOR USER
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

    const cart = await CartItem.find({ userId }).sort({ addedAt: -1 });

    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({
      success: true,
      cart,
      totalItems,
      totalPrice,
      count: cart.length,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 2. ADD ITEM TO CART
// ============================================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, productName, price, image, category, quantity = 1 } =
      req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (
      !productId ||
      !productName ||
      !price ||
      !image ||
      !category ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing or invalid required fields: productId, productName, price, image, category, quantity",
      });
    }

    // Check if already in cart
    const existing = await CartItem.findOne({
      userId,
      productId,
    });

    if (existing) {
      // Update quantity instead of creating new
      existing.quantity += quantity;
      const updated = await existing.save();

      return res.json({
        success: true,
        message: "Item quantity updated in cart",
        item: updated,
      });
    }

    // Create new cart item
    const item = new CartItem({
      userId,
      productId,
      productName,
      price,
      image,
      category,
      quantity,
    });

    const savedItem = await item.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      item: savedItem,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 3. UPDATE ITEM QUANTITY
// ============================================
router.put("/:itemId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!itemId || quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid item ID and quantity (>= 1) required",
      });
    }

    const item = await CartItem.findOneAndUpdate(
      { _id: itemId, userId },
      { quantity },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Item quantity updated",
      item,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 4. REMOVE ITEM FROM CART
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
    const result = await CartItem.findOneAndDelete({
      _id: itemId,
      userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 5. REMOVE ITEM BY PRODUCT ID
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
    const result = await CartItem.findOneAndDelete({
      userId,
      productId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// 6. CLEAR ALL CART ITEMS
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

    const result = await CartItem.deleteMany({ userId });

    res.json({
      success: true,
      message: "Cart cleared",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
