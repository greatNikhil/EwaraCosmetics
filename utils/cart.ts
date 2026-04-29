import { useCartStore } from "@/store/cartStore";
import { cartApi } from "@/utils/cartApi";
import { getAllProducts } from "@/utils/productApi";
import { getClientToken } from "@/utils/clientAuth";

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
const getToken = (): string | null => getClientToken();

export const mergeGuestCartIntoBackend = async (
  token: string,
  guestItems: ReturnType<typeof useCartStore.getState>["items"]
) => {
  if (!token || guestItems.length === 0) {
    await useCartStore.getState().syncFromBackend(token);
    return;
  }

  for (const item of guestItems) {
    await cartApi.add(
      token,
      {
        productId: item.id,
        productName: item.name,
        price: item.price,
        image: item.image,
        category: item.category || "General",
      },
      item.quantity
    );
  }

  await useCartStore.getState().syncFromBackend(token);
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

export type CartSyncResult = {
  removedCount: number;
  updatedCount: number;
  quantityAdjustedCount: number;
};

export const syncCartWithCatalog = async (): Promise<CartSyncResult> => {
  try {
    const data = await getAllProducts();
    const productMap = new Map(
      (data.products || []).map((product) => [product._id, product])
    );
    const store = useCartStore.getState();
    const syncedItems = [];
    let removedCount = 0;
    let updatedCount = 0;
    let quantityAdjustedCount = 0;

    for (const item of store.items) {
      const product = productMap.get(item.id);
      const stockCount = Math.max(product?.countInStock ?? 0, 0);

      if (!product || !product.isPublished || stockCount === 0) {
        removedCount += 1;
        continue;
      }

      const nextQuantity = Math.min(item.quantity, stockCount);
      const nextItem = {
        ...item,
        name: product.name,
        price: product.price,
        quantity: nextQuantity,
        image: product.images?.[0] || item.image || "/favicon/product.jpeg",
        category: product.category || product.brand || item.category || "General",
      };

      if (nextQuantity !== item.quantity) {
        quantityAdjustedCount += 1;
      }

      if (
        nextItem.name !== item.name ||
        nextItem.price !== item.price ||
        nextItem.image !== item.image ||
        nextItem.category !== item.category
      ) {
        updatedCount += 1;
      }

      syncedItems.push(nextItem);
    }

    if (removedCount > 0 || updatedCount > 0 || quantityAdjustedCount > 0) {
      useCartStore.setState({ items: syncedItems });

      const token = getToken();
      if (token) {
        try {
          await store.syncToBackend(token);
        } catch (error) {
          console.error("Failed to sync cleaned cart to backend:", error);
        }
      }
    }

    return { removedCount, updatedCount, quantityAdjustedCount };
  } catch (error) {
    console.error("Failed to sync cart with catalog:", error);
    return { removedCount: 0, updatedCount: 0, quantityAdjustedCount: 0 };
  }
};

export const removeUnavailableCartItems = async (): Promise<number> => {
  const result = await syncCartWithCatalog();
  return result.removedCount;
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
