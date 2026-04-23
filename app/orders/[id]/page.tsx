"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          alert("Order not found");
          router.push("/orders");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error("ORDER DETAILS ERROR:", error);
        router.push("/orders");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-[#4a2c2a] mb-6">
          Order Details
        </h1>

        {/* Order Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-semibold">{order._id}</p>

          <p className="mt-3 text-sm text-gray-500">Date</p>
          <p>
            {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </p>

          <p className="mt-3 text-sm text-gray-500">Status</p>
          <p className="font-medium">{order.status}</p>

          <p className="mt-3 text-sm text-gray-500">Payment</p>
          <p>{order.paymentMethod}</p>
        </div>

        {/* Items */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Items</h2>

          <div className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 border rounded-xl p-4"
              >
                <img
                  src={item.image || "/fallback.png"}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 border-t pt-4 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-[#7a1f2b]">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}