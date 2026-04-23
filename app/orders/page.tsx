"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import OrderCard from "@/components/orders/OrderCard";

export default function OrdersPage() {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#7a1f2b]">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#4a2c2a]">My Orders</h1>
          <p className="mt-2 text-[#6b7280]">
            Track and review your recent orders.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-[#7a1f2b]">
              No orders found.
            </p>
            <p className="mt-3 text-[#6b7280]">
              Once you place an order, it will appear here.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#7a1f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#8d2742]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}