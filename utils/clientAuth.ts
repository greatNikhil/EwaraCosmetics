"use client";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { clearWishlistCache } from "@/utils/wishlist";

interface ClientUser {
  _id?: string;
  id?: string;
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export function persistClientAuth(user: ClientUser, token: string) {
  if (typeof window === "undefined") return;

  const normalizedUser = {
    ...user,
    id: user._id || user.id,
  };

  localStorage.setItem("token", token);

  useAuthStore.getState().setUser(normalizedUser as any);
  useAuthStore.getState().setToken(token);
}

export function getClientToken() {
  if (typeof window === "undefined") return null;

  return useAuthStore.getState().token || localStorage.getItem("token");
}

export function clearClientAuth(options?: { dispatchEvent?: boolean }) {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("adminData");

  useAuthStore.getState().logout();
  useCartStore.getState().clearCart();
  clearWishlistCache();

  if (options?.dispatchEvent) {
    window.dispatchEvent(new Event("userChanged"));
  }
}
