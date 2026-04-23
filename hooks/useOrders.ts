"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const loadOrders = async () => {
      const storedData = localStorage.getItem("userData");
      const token = localStorage.getItem("token");

      if (!storedData || !token) {
        setUser(null);
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedData);
        setUser(parsed);

        const endpoint =
          parsed.role === "admin"
            ? "http://localhost:5000/api/orders"
            : "http://localhost:5000/api/orders/my";

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
  }, []);

  return { orders, user, loading };
}