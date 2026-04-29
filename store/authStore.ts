import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  lastname?: string;
  address: string;
  flat?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  default?: boolean;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  lastname?: string;
  email: string;
  phone: string;
  role: string;
  addresses?: Address[];
}

interface AuthStore {
  user: User | null;
  token: string | null;
  addresses: Address[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAddresses: (addresses: Address[]) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      addresses: [],
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAddresses: (addresses) => set({ addresses }),
      logout: () => set({ user: null, token: null, addresses: [] }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);
