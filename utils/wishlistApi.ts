/**
 * WISHLIST API WRAPPER
 * Backend API communication for wishlist management
 */

import { buildApiUrl } from "./api";

export interface WishlistItem {
  _id?: string;
  userId?: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  brand?: string;
  category: string;
  addedAt?: string;
}

export const wishlistApi = {
  /**
   * Get all wishlist items for the current user
   */
  getAll: async (token: string) => {
    try {
      const res = await fetch(buildApiUrl("/api/wishlist"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return await res.json();
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      throw error;
    }
  },

  /**
   * Add item to wishlist
   */
  add: async (
    token: string,
    item: Omit<WishlistItem, "_id" | "userId" | "addedAt">
  ) => {
    try {
      const res = await fetch(buildApiUrl("/api/wishlist/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add to wishlist");
      }
      return await res.json();
    } catch (error) {
      console.error("Wishlist add error:", error);
      throw error;
    }
  },

  /**
   * Remove item from wishlist by ID
   */
  remove: async (token: string, itemId: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/wishlist/${itemId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove from wishlist");
      return await res.json();
    } catch (error) {
      console.error("Wishlist remove error:", error);
      throw error;
    }
  },

  /**
   * Remove item by product ID
   */
  removeByProductId: async (token: string, productId: string) => {
    try {
      const res = await fetch(
        buildApiUrl(`/api/wishlist/product/${productId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to remove from wishlist");
      return await res.json();
    } catch (error) {
      console.error("Wishlist remove error:", error);
      throw error;
    }
  },

  /**
   * Check if product is in wishlist
   */
  check: async (token: string, productId: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/wishlist/check/${productId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to check wishlist");
      return await res.json();
    } catch (error) {
      console.error("Wishlist check error:", error);
      throw error;
    }
  },

  /**
   * Clear all wishlist items
   */
  clear: async (token: string) => {
    try {
      const res = await fetch(buildApiUrl("/api/wishlist"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to clear wishlist");
      return await res.json();
    } catch (error) {
      console.error("Wishlist clear error:", error);
      throw error;
    }
  },
};
