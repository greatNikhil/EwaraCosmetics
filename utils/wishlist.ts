import { wishlistApi } from "./wishlistApi";
import { getClientToken } from "./clientAuth";

export interface WishlistProduct {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  countInStock?: number;
  images?: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  category: string;
}

const WISHLIST_EVENT = "wishlistChanged";

let wishlistCache: WishlistItem[] = [];

const notifyWishlistChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WISHLIST_EVENT));
};

const getToken = (): string | null => {
  return getClientToken();
};

export const clearWishlistCache = () => {
  wishlistCache = [];
  notifyWishlistChanged();
};

export const syncWishlistFromBackend = async (token?: string | null) => {
  const authToken = token || getToken();

  if (!authToken) {
    clearWishlistCache();
    return [];
  }

  try {
    const response = await wishlistApi.getAll(authToken);
    wishlistCache = response?.success ? response.wishlist || [] : [];
    notifyWishlistChanged();
    return wishlistCache;
  } catch (error) {
    console.error("Failed to sync wishlist from backend:", error);
    return wishlistCache;
  }
};

export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  if (typeof window === "undefined") return [];

  const token = getToken();
  if (!token) return [];

  try {
    return await syncWishlistFromBackend(token);
  } catch (error) {
    console.error("Failed to fetch wishlist from backend:", error);
    return wishlistCache;
  }
};

export const saveWishlistItems = (items: WishlistItem[]) => {
  wishlistCache = items;
  notifyWishlistChanged();
};

export const isInWishlist = async (product: WishlistProduct): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await wishlistApi.check(token, product._id);
    return response?.success ? response.inWishlist || false : false;
  } catch (error) {
    console.error("Failed to check wishlist status:", error);
    return wishlistCache.some((item) => item._id === product._id);
  }
};

export const toggleWishlist = async (product: WishlistProduct): Promise<boolean> => {
  const token = getToken();
  if (!token) {
    console.warn("Not authenticated - cannot toggle wishlist");
    return false;
  }

  try {
    const isCurrentlyInWishlist = await isInWishlist(product);

    if (isCurrentlyInWishlist) {
      const response = await wishlistApi.removeByProductId(token, product._id);
      if (response?.success) {
        wishlistCache = wishlistCache.filter((item) => item._id !== product._id);
        notifyWishlistChanged();
        return false;
      }
    } else {
      const category = product.category || product.brand || "General";
      const newItem: WishlistItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || "/favicon/product.jpeg",
        brand: product.brand,
        category,
      };

      const response = await wishlistApi.add(token, {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.images?.[0] || "/favicon/product.jpeg",
        brand: product.brand,
        category,
      });

      if (response?.success) {
        wishlistCache = [...wishlistCache, newItem];
        notifyWishlistChanged();
        return true;
      }
    }

    return isCurrentlyInWishlist;
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    return false;
  }
};

export const removeFromWishlist = async (_id: string) => {
  const token = getToken();
  if (!token) return;

  try {
    const response = await wishlistApi.remove(token, _id);
    if (response?.success) {
      wishlistCache = wishlistCache.filter((item) => item._id !== _id);
      notifyWishlistChanged();
    }
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
  }
};

export const clearWishlist = async () => {
  const token = getToken();
  if (!token) {
    clearWishlistCache();
    return;
  }

  try {
    await wishlistApi.clear(token);
    wishlistCache = [];
    notifyWishlistChanged();
  } catch (error) {
    console.error("Failed to clear wishlist:", error);
  }
};

export const getWishlistCount = (): number => wishlistCache.length;

export const wishlistChangedEvent = WISHLIST_EVENT;
