import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { CartItem } from "../models/CartItem";

const router = Router();

const serializeCartItem = (item: CartItem) => {
  const plain = item.get({ plain: true });
  return { ...plain, _id: plain.id };
};

router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cart = await CartItem.findAll({
      where: { userId },
      order: [["addedAt", "DESC"]],
    });

    const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    res.json({
      success: true,
      cart: cart.map((item) => serializeCartItem(item)),
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

router.post("/add", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);
    const { productId, productName, price, image, category, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!productId || !productName || !price || !image || !category || quantity < 1) {
      return res.status(400).json({
        success: false,
        message:
          "Missing or invalid required fields: productId, productName, price, image, category, quantity",
      });
    }

    const existing = await CartItem.findOne({
      where: {
        userId,
        productId: String(productId),
      },
    });

    if (existing) {
      existing.quantity += Number(quantity);
      const updated = await existing.save();

      return res.json({
        success: true,
        message: "Item quantity updated in cart",
        item: serializeCartItem(updated),
      });
    }

    const savedItem = await CartItem.create({
      userId,
      productId: String(productId),
      productName: String(productName),
      price: Number(price),
      image: String(image),
      category: String(category),
      quantity: Number(quantity),
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      item: serializeCartItem(savedItem),
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

router.put("/:itemId", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!itemId || quantity === undefined || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid item ID and quantity (>= 1) required",
      });
    }

    const item = await CartItem.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.quantity = Number(quantity);
    await item.save();

    res.json({
      success: true,
      message: "Item quantity updated",
      item: serializeCartItem(item),
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

router.delete("/:itemId", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);
    const itemId = Number(req.params.itemId);

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

    const deletedCount = await CartItem.destroy({
      where: { id: itemId, userId },
    });

    if (!deletedCount) {
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

router.delete("/product/:productId", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);
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

    const deletedCount = await CartItem.destroy({
      where: { userId, productId: String(productId) },
    });

    if (!deletedCount) {
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

router.delete("/", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const deletedCount = await CartItem.destroy({ where: { userId } });

    res.json({
      success: true,
      message: "Cart cleared",
      deletedCount,
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
