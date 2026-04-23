export interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  countInStock: number;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
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

const WISHLIST_KEY = "wishlistItems";

export const getWishlistItems = (): WishlistItem[] => {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(WISHLIST_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveWishlistItems = (items: WishlistItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
};

export const isInWishlist = (product: WishlistProduct): boolean => {
  const items = getWishlistItems();
  return items.some((item) => item._id === product._id);
};

export const toggleWishlist = (product: WishlistProduct): boolean => {
  const items = getWishlistItems();

  const exists = items.some((item) => item._id === product._id);

  if (exists) {
    const updatedItems = items.filter((item) => item._id !== product._id);
    saveWishlistItems(updatedItems);
    return false;
  }

  const newItem: WishlistItem = {
    _id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.images?.[0] || "/favicon/product.jpeg",
    brand: product.brand,
    category: product.category,
  };

  saveWishlistItems([...items, newItem]);
  return true;
};

export const removeFromWishlist = (_id: string) => {
  const updatedItems = getWishlistItems().filter((item) => item._id !== _id);
  saveWishlistItems(updatedItems);
};

export const clearWishlist = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WISHLIST_KEY);
};

export const getWishlistCount = (): number => {
  return getWishlistItems().length;
};