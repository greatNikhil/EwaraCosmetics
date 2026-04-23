"use client";

import Link from "next/link";
import { BackendOrder } from "@/hooks/useOrders";

interface OrderCardProps {
  order: BackendOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
  const firstItem = order.items?.[0];
  const itemCount = order.items?.length || 0;

  return (
    <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#f7e9e7]">
            <img
              src={firstItem?.image || "/favicon/product.jpeg"}
              alt={firstItem?.name || "Order item"}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
              Order ID
            </p>
            <p className="font-semibold text-[#3e2f2b]">{order._id}</p>

            <p className="mt-2 text-sm text-[#5a4f4d]">
              {firstItem?.name || "Product"}
              {itemCount > 1 ? ` + ${itemCount - 1} more item(s)` : ""}
            </p>

            <p className="mt-1 text-sm text-[#7a6f6b]">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              order.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : order.status === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {order.status}
          </span>

          <p className="text-lg font-bold text-[#7a1f2b]">
            ₹{order.totalAmount}
          </p>

          <p className="text-sm text-[#6b7280]">{order.paymentMethod}</p>

          <Link
            href={`/orders/${order._id}`}
            className="text-sm font-medium text-[#7a1f2b] hover:underline"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}