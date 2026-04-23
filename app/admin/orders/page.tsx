"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";

const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch admin orders:", data.message);
      }
    } catch (error) {
      console.error("ADMIN ORDERS FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      setUpdatingId(orderId);

      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to update status");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <AdminNav />

      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4a2c2a]">
              Order Management
            </h1>
            <p className="mt-2 text-[#5e3339]">
              Track and manage customer orders.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#7a1f2b]">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#7a1f2b]">
                No orders found.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#7a1f2b]/70">
                        Order ID
                      </p>
                      <p className="font-semibold text-[#3e2f2b] break-all">
                        {order._id}
                      </p>

                      <p className="mt-3 text-sm text-[#6b7280]">
                        Customer:{" "}
                        <span className="font-medium text-[#3e2f2b]">
                          {order.user?.name || "N/A"}
                        </span>
                      </p>

                      <p className="text-sm text-[#6b7280]">
                        Email:{" "}
                        <span className="font-medium text-[#3e2f2b]">
                          {order.user?.email || "N/A"}
                        </span>
                      </p>

                      <p className="mt-3 text-sm text-[#6b7280]">
                        Date:{" "}
                        <span className="font-medium text-[#3e2f2b]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </p>

                      <p className="text-sm text-[#6b7280]">
                        Payment:{" "}
                        <span className="font-medium text-[#3e2f2b]">
                          {order.paymentMethod}
                        </span>
                      </p>
                    </div>

                    <div className="lg:min-w-[260px]">
                      <p className="mb-2 text-sm font-medium text-[#4a2c2a]">
                        Update Status
                      </p>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={updatingId === order._id}
                        className="w-full rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 text-[#3e2f2b] outline-none focus:border-[#7a1f2b]"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <p className="mt-4 text-lg font-bold text-[#7a1f2b]">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#f1e5df] pt-4">
                    <p className="mb-3 text-sm font-semibold text-[#4a2c2a]">
                      Items
                    </p>

                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 rounded-2xl bg-[#fffaf7] p-3"
                        >
                          <img
                            src={item.image || "/favicon/product.jpeg"}
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />

                          <div className="flex-1">
                            <p className="font-medium text-[#3e2f2b]">
                              {item.name}
                            </p>
                            <p className="text-sm text-[#6b7280]">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="font-semibold text-[#7a1f2b]">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}