"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Package, ShoppingBag } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import MyOrders from "@/components/profile/MyOrders";
import { useAuthStore } from "@/store/authStore";

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusBadgeClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "delivered") return "bg-[#eaf3de] text-[#3B6D11]";
  if (normalized === "shipped") return "bg-[#e6f1fb] text-[#185FA5]";
  if (normalized === "processing" || normalized === "pending") {
    return "bg-[#faeeda] text-[#854F0B]";
  }
  if (normalized === "cancelled") return "bg-[#fcebeb] text-[#a32d2d]";
  return "bg-[#f5e8eb] text-[#7B2D42]";
};

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasSession(Boolean(token || window.localStorage.getItem("token")));
  }, [token]);

  if (!mounted) {
    return null;
  }

  if (!hasSession) {
    return (
      <main className="min-h-screen bg-[#fff8f5] px-4 py-16 md:px-8">
        <section className="mx-auto flex max-w-3xl flex-col items-center rounded-[28px] border border-[#f0dde2] bg-white px-6 py-14 text-center shadow-[0_22px_60px_rgba(67,38,47,0.08)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e7ea] text-[#7B2D42]">
            <Package size={28} strokeWidth={1.8} />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B2D42]/70">
            Track Order
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#2f1f25]">
            Sign in to view your orders
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[#7a6f6b]">
            Your order tracking, payment status, and delivery updates are saved
            inside your Ewara account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#7B2D42] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#672438]"
            >
              Login
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-[#ead2d8] px-6 py-3 text-sm font-semibold text-[#7B2D42] transition hover:bg-[#fdf6f7]"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f5] to-white px-4 py-12 md:px-8 md:py-16">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 rounded-[28px] border border-[#f0dde2] bg-white px-6 py-8 shadow-[0_22px_60px_rgba(67,38,47,0.08)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B2D42] text-white">
              <Package size={24} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B2D42]/70">
                Track Order
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-[#2f1f25]">
                My Orders
              </h1>
              <p className="mt-2 text-sm text-[#7a6f6b]">
                Track delivery, payment, return, and exchange status from one place.
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ead2d8] px-5 py-3 text-sm font-semibold text-[#7B2D42] transition hover:bg-[#fdf6f7]"
          >
            <ShoppingBag size={16} />
            Shop More
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#f0dde2] bg-white p-4 shadow-[0_18px_48px_rgba(67,38,47,0.07)] md:p-6">
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <LoaderCircle
                className="h-8 w-8 animate-spin text-[#7B2D42]"
                strokeWidth={1.8}
              />
              <p className="mt-4 text-sm font-medium text-[#7a6f6b]">
                Loading your orders...
              </p>
            </div>
          ) : (
            <MyOrders
              orders={orders}
              formatDate={formatDate}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          )}
        </div>
      </section>
    </main>
  );
}
