"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { buildApiUrl } from "@/utils/api";

export interface BackendOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface BackendOrder {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  items: BackendOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ Get user from authStore instead of localStorage
  const authUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const loadOrders = async () => {
      // ✅ Use authStore user instead of localStorage
      if (!authUser || !token) {
        setUser(null);
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setUser(authUser);

        const endpoint =
          authUser.role === "admin"
            ? buildApiUrl("/api/orders")
            : buildApiUrl("/api/orders/my");

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setOrders([]);
          setLoading(false);
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("USE ORDERS ERROR:", error);
        setUser(null);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    const handleRefresh = () => {
      loadOrders();
    };

    window.addEventListener("storage", handleRefresh);
    window.addEventListener("userChanged", handleRefresh);

    return () => {
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("userChanged", handleRefresh);
    };
  }, [authUser, token]);

  return { orders, user, loading };
}
