export interface CartProduct {
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

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  countInStock: number;
}

const CART_KEY = "cartItems";

export const getCartItems = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(CART_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveCartItems = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const addToCart = (product: CartProduct) => {
  const cartItems = getCartItems();

  const existingItem = cartItems.find((item) => item._id === product._id);

  if (existingItem) {
    if (existingItem.quantity < product.countInStock) {
      existingItem.quantity += 1;
    }
  } else {
    cartItems.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || "/favicon/product.jpeg",
      quantity: 1,
      countInStock: product.countInStock,
    });
  }

  saveCartItems(cartItems);
};

export const removeFromCart = (_id: string) => {
  const cartItems = getCartItems().filter((item) => item._id !== _id);
  saveCartItems(cartItems);
};

export const updateCartQuantity = (_id: string, quantity: number) => {
  const cartItems = getCartItems().map((item) => {
    if (item._id === _id) {
      return {
        ...item,
        quantity: Math.max(1, Math.min(quantity, item.countInStock)),
      };
    }
    return item;
  });

  saveCartItems(cartItems);
};

export const clearCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
};

export const getCartCount = (): number => {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
};

export const getCartTotal = (): number => {
  return getCartItems().reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};