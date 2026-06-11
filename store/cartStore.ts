import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/utils/cartApi';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  // ✅ NEW: Backend sync functions
  syncFromBackend: (token: string) => Promise<void>;
  syncToBackend: (token: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      category: i.category || item.category || "General",
                    }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                category: item.category || "General",
              },
            ],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      // ✅ NEW: Fetch cart from backend and update local state
      syncFromBackend: async (token: string) => {
        try {
          const response = await cartApi.getAll(token);
          if (response?.success && response.cart) {
            const normalizedItems: CartItem[] = response.cart.map((item: any) => ({
              id: item.productId || item._id,
              name: item.productName || item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              category: item.category || "General",
            }));
            set({ items: normalizedItems });
          }
        } catch (error) {
          console.error('Failed to sync cart from backend:', error);
        }
      },
      // ✅ NEW: Push local cart to backend
      syncToBackend: async (token: string) => {
        try {
          const items = get().items;
          if (items.length === 0) {
            await cartApi.clear(token);
            return;
          }

          // Clear backend cart first
          await cartApi.clear(token);

          // Add all local items to backend
          for (const item of items) {
            await cartApi.add(token, {
              productId: item.id,
              productName: item.name,
              price: item.price,
              image: item.image,
              category: item.category || "General",
            }, item.quantity);
          }
        } catch (error) {
          console.error('Failed to sync cart to backend:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
