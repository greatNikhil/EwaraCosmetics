import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { WishlistItem } from "../models/WishlistItem";

const router = Router();

const serializeWishlistItem = (item: WishlistItem) => {
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

    const wishlist = await WishlistItem.findAll({
      where: { userId },
      order: [["addedAt", "DESC"]],
    });

    res.json({
      success: true,
      wishlist: wishlist.map((item) => serializeWishlistItem(item)),
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

router.post("/add", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);
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

    const existing = await WishlistItem.findOne({
      where: {
        userId,
        productId: String(productId),
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist",
        item: serializeWishlistItem(existing),
      });
    }

    const savedItem = await WishlistItem.create({
      userId,
      productId: String(productId),
      productName: String(productName),
      price: Number(price),
      image: String(image),
      category: String(category),
    });

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      item: serializeWishlistItem(savedItem),
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

    const deletedCount = await WishlistItem.destroy({
      where: { id: itemId, userId },
    });

    if (!deletedCount) {
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

    const deletedCount = await WishlistItem.destroy({
      where: { userId, productId: String(productId) },
    });

    if (!deletedCount) {
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

router.get("/check/:productId", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const item = await WishlistItem.findOne({
      where: { userId, productId: String(productId) },
    });

    res.json({
      success: true,
      inWishlist: !!item,
      item: item ? serializeWishlistItem(item) : null,
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

router.delete("/", authMiddleware, async (req: any, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const deletedCount = await WishlistItem.destroy({ where: { userId } });

    res.json({
      success: true,
      message: "Wishlist cleared",
      deletedCount,
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
