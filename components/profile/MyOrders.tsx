"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type MyOrdersProps = {
  orders: any[];
  formatDate: (value?: string) => string;
  getStatusBadgeClass: (status?: string) => string;
};

export default function MyOrders({
  orders,
  formatDate,
  getStatusBadgeClass,
}: MyOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] py-12 text-center">
        <p className="text-lg font-medium text-[#2f1f25]">No orders yet</p>
        <p className="mt-2 text-sm text-[#7a6f6b]">
          Start shopping to see your orders here.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-[#7B2D42] px-6 py-3 font-semibold text-white transition hover:shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <Link key={order._id || order.id} href={`/orders/${order._id || order.id}`}>
          <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-3 transition hover:border-[#e4c4cc]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#2f1f25]">
                  Order #{String(order._id || order.id).slice(-6)}
                </p>
                <p className="mt-1 truncate text-sm text-[#6f5b63]">
                  {order.items
                    ?.map((item: any) => item.productName || item.name)
                    .filter(Boolean)
                    .join(", ") || "Items unavailable"}
                </p>
                <p className="mt-1 text-xs text-[#8b7680]">
                  {formatDate(order.createdAt)} - Rs.{" "}
                  {Number(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <ChevronRight
                  size={16}
                  className="text-[#8f6d78]"
                  strokeWidth={1.8}
                />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
