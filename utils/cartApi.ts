/**
 * CART API WRAPPER
 * Backend API communication for cart management
 */

import { buildApiUrl } from "./api";

export interface CartItem {
  _id?: string;
  userId?: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  addedAt?: string;
}

export interface CartResponse {
  success: boolean;
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  count: number;
  message?: string;
}

export const cartApi = {
  /**
   * Get all cart items for the current user
   */
  getAll: async (token: string): Promise<CartResponse> => {
    try {
      const res = await fetch(buildApiUrl("/api/cart"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch cart");
      return await res.json();
    } catch (error) {
      console.error("Cart fetch error:", error);
      throw error;
    }
  },

  /**
   * Add item to cart
   */
  add: async (
    token: string,
    item: Omit<CartItem, "_id" | "userId" | "addedAt" | "quantity">,
    quantity: number = 1
  ) => {
    try {
      const res = await fetch(buildApiUrl("/api/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...item, quantity }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add to cart");
      }
      return await res.json();
    } catch (error) {
      console.error("Cart add error:", error);
      throw error;
    }
  },

  /**
   * Update item quantity
   */
  updateQuantity: async (
    token: string,
    itemId: string,
    quantity: number
  ) => {
    try {
      const res = await fetch(buildApiUrl(`/api/cart/${itemId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) throw new Error("Failed to update cart item");
      return await res.json();
    } catch (error) {
      console.error("Cart update error:", error);
      throw error;
    }
  },

  /**
   * Remove item from cart by ID
   */
  remove: async (token: string, itemId: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/cart/${itemId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove from cart");
      return await res.json();
    } catch (error) {
      console.error("Cart remove error:", error);
      throw error;
    }
  },

  /**
   * Remove item by product ID
   */
  removeByProductId: async (token: string, productId: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/cart/product/${productId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove from cart");
      return await res.json();
    } catch (error) {
      console.error("Cart remove error:", error);
      throw error;
    }
  },

  /**
   * Clear all cart items
   */
  clear: async (token: string) => {
    try {
      const res = await fetch(buildApiUrl("/api/cart"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to clear cart");
      return await res.json();
    } catch (error) {
      console.error("Cart clear error:", error);
      throw error;
    }
  },
};
