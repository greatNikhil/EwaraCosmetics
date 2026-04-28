import { useCartStore } from "@/store/cartStore";
import { getAllProducts } from "@/utils/productApi";

export interface CartProduct {
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

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  countInStock: number;
}

const mapStoreItemToCartItem = (
  item: ReturnType<typeof useCartStore.getState>["items"][number]
): CartItem => ({
  _id: item.id,
  name: item.name,
  price: item.price,
  image: item.image,
  quantity: item.quantity,
  countInStock: Number.MAX_SAFE_INTEGER,
});

// ✅ Helper function to get token for backend sync
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getCartItems = (): CartItem[] => {
  return useCartStore.getState().items.map(mapStoreItemToCartItem);
};

export const saveCartItems = (items: CartItem[]) => {
  const normalizedItems = items.map((item) => ({
    id: item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  useCartStore.setState({ items: normalizedItems });
};

export const addToCart = async (product: CartProduct) => {
  const store = useCartStore.getState();
  const existingItem = store.items.find((item) => item.id === product._id);
  const maxStock = product.countInStock ?? Number.MAX_SAFE_INTEGER;

  if (existingItem && existingItem.quantity >= maxStock) {
    return;
  }

  store.addItem({
    id: product._id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.images?.[0] || "/favicon/product.jpeg",
    category: product.category || product.brand || "General",
  });

  // ✅ NEW: Sync to backend if logged in
  const token = getToken();
  if (token) {
    try {
      await store.syncToBackend(token);
    } catch (error) {
      console.error("Failed to sync cart to backend:", error);
    }
  }
};

export const removeFromCart = async (_id: string) => {
  const store = useCartStore.getState();
  store.removeItem(_id);

  // ✅ NEW: Sync to backend if logged in
  const token = getToken();
  if (token) {
    try {
      await store.syncToBackend(token);
    } catch (error) {
      console.error("Failed to sync cart to backend:", error);
    }
  }
};

export const updateCartQuantity = async (_id: string, quantity: number) => {
  const item = getCartItems().find((cartItem) => cartItem._id === _id);
  if (!item) return;

  const store = useCartStore.getState();
  store.updateQuantity(_id, Math.max(1, Math.min(quantity, item.countInStock)));

  // ✅ NEW: Sync to backend if logged in
  const token = getToken();
  if (token) {
    try {
      await store.syncToBackend(token);
    } catch (error) {
      console.error("Failed to sync cart to backend:", error);
    }
  }
};

export const clearCart = async () => {
  const store = useCartStore.getState();
  store.clearCart();

  // ✅ NEW: Sync to backend if logged in
  const token = getToken();
  if (token) {
    try {
      await store.syncToBackend(token);
    } catch (error) {
      console.error("Failed to sync cart to backend:", error);
    }
  }
};

export const removeUnavailableCartItems = async (): Promise<number> => {
  try {
    const data = await getAllProducts();
    const validProductIds = new Set(
      (data.products || []).map((product) => product._id)
    );

    const store = useCartStore.getState();
    const validItems = store.items.filter((item) => validProductIds.has(item.id));
    const removedCount = store.items.length - validItems.length;

    if (removedCount > 0) {
      useCartStore.setState({ items: validItems });

      const token = getToken();
      if (token) {
        try {
          await store.syncToBackend(token);
        } catch (error) {
          console.error("Failed to sync cleaned cart to backend:", error);
        }
      }
    }

    return removedCount;
  } catch (error) {
    console.error("Failed to remove unavailable cart items:", error);
    return 0;
  }
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
