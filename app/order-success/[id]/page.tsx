"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError("Failed to load order.");
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(
          err?.response?.data?.message || "Something went wrong while loading your order."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
          <p className="text-lg font-medium text-gray-700">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-3">Order page unavailable</h1>
          <p className="text-gray-600 mb-6">{error || "Order not found."}</p>
          <button
            onClick={() => router.push("/my-orders")}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const totalItems = order.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="text-center border-b px-6 py-8">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Order Placed Successfully
          </h1>
          <p className="text-gray-600">
            Your order has been confirmed and is now being processed.
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="border rounded-xl p-4">
              <p className="text-gray-500 mb-1">Order ID</p>
              <p className="font-semibold break-all">{order._id}</p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-gray-500 mb-1">Payment Method</p>
              <p className="font-semibold">{order.paymentMethod}</p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-gray-500 mb-1">Status</p>
              <p className="font-semibold">{order.status}</p>
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total Amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/orders/${order._id}`)}
              className="flex-1 bg-black text-white py-3 rounded-xl font-medium"
            >
              View Order Details
            </button>

            <button
              onClick={() => router.push("/my-orders")}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-medium"
            >
              Go to My Orders
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}