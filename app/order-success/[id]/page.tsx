"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Package, Truck, ArrowRight, Home } from "lucide-react";
import { buildApiUrl } from "@/utils/api";
import { getClientToken } from "@/utils/clientAuth";

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
        const token = getClientToken();

        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(buildApiUrl(`/api/orders/${orderId}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError("Failed to load order.");
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(
          err?.response?.data?.message ||
            "Something went wrong while loading your order."
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--blush-bg)] px-4 py-10">
        <div className="w-full max-w-md rounded-[14px] border border-[var(--blush-border)] bg-[var(--blush-bg)] p-8 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blush-light)]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--blush-brand)] border-t-transparent" />
          </div>
          <p className="text-[16px] font-medium text-[var(--blush-dark)]">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--blush-bg)] px-4 py-10">
        <div className="w-full max-w-md rounded-[14px] border border-[var(--blush-border)] bg-[var(--blush-bg)] p-8 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf0f0]">
            <span className="text-2xl font-bold text-red-600">!</span>
          </div>
          <h1 className="mb-3 text-[20px] font-medium text-[var(--blush-dark)]">
            Order page unavailable
          </h1>
          <p className="mb-8 text-[11px] leading-[1.6] text-[var(--blush-muted)]">
            {error || "Order not found."}
          </p>
          <button
            onClick={() => router.push("/orders")}
            className="w-full rounded-[9px] bg-[var(--blush-brand)] px-6 py-3 text-[11px] font-medium text-white transition-colors duration-200"
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
  const itemsTotal = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const normalizedStatus = String(order.status || "").toLowerCase();
  const statusPillClass =
    normalizedStatus === "cancelled" || normalizedStatus === "failed"
      ? "border-[#f0c8c8] bg-[#fdf0f0] text-[#a32d2d]"
      : normalizedStatus === "pending" || normalizedStatus === "processing"
        ? "border-[#f5c97a] bg-[#fff4e0] text-[#b45300]"
        : "border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green-text)]";
  const deliveryDateSource =
    order.deliveryDate || order.updatedAt || order.createdAt;
  const deliveryDateLabel = deliveryDateSource
    ? new Date(deliveryDateSource).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";
  const shippingValue =
    Number(order.shippingAmount || 0) === 0
      ? "Free"
      : `Rs. ${Number(order.shippingAmount || 0)}`;
  const gstValue =
    typeof order.gstAmount === "number"
      ? order.gstAmount
      : Math.max(
          0,
          Number(order.totalAmount || 0) -
            Number(itemsTotal || 0) -
            Number(order.shippingAmount || 0)
        );

  return (
    <div className="min-h-screen bg-[var(--blush-bg)] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-[520px] overflow-hidden rounded-[16px] border border-[#e8d5d5] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
        <div className="border-b border-[#e8d5d5] px-5 pb-4 pt-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-20 w-20 animate-[pulse_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-[#7a1a2e]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-1.5 text-[24px] font-bold text-[#1a1a1a]">
            Order confirmed!
          </h1>
          <p className="mx-auto max-w-[240px] text-[11px] leading-[1.6] text-[var(--blush-muted)]">
            Thank you for your purchase. Your order has been successfully placed
            and is being prepared for shipment.
          </p>
        </div>

        <div className="m-4 grid grid-cols-3 rounded-[10px] border border-[#eedede] bg-[#fdf6f6]">
          <div className="border-r border-[#eedede] px-3 py-3">
            <div className="mb-[5px] flex items-center gap-1">
              <Package className="h-3 w-3 text-[var(--blush-muted)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888]">
                Order ID
              </p>
            </div>
            <p className="break-all text-[11px] font-medium leading-[1.4] text-[#1a1a1a]">
              {order._id}
            </p>
          </div>

          <div className="border-r border-[#eedede] px-3 py-3">
            <div className="mb-[5px] flex items-center gap-1">
              <span className="text-[10px] font-medium text-[var(--blush-muted)]">
                {"\u20B9"}
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888]">
                Payment
              </p>
            </div>
            <p className="break-all text-[11px] font-medium leading-[1.4] text-[#1a1a1a]">
              {order.paymentMethod}
            </p>
          </div>

          <div className="px-3 py-3">
            <div className="mb-[5px] flex items-center gap-1">
              <Truck className="h-3 w-3 text-[var(--blush-muted)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888]">
                Status
              </p>
            </div>
            <span
              className={`inline-flex rounded-[20px] border px-[9px] py-[3px] text-[12px] font-semibold ${statusPillClass}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="px-[15px] py-[13px]">
          <section className="mb-3">
            <h2 className="mb-[9px] text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--blush-brand)]">
              Order summary
            </h2>

            <div className="mb-3 space-y-0">
              {order.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="mb-[10px] flex items-start justify-between last:mb-0"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-[12px] font-medium text-[#1a1a1a]">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#555]">
                      Qty: {item.quantity} {"\u00D7"} {"\u20B9"}
                      {item.price}
                    </p>
                  </div>
                  <p className="text-[12px] font-medium text-[var(--blush-brand)]">
                    Rs. {item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-3 rounded-[10px] border border-[#eedede] bg-[#fdf6f6] px-3 py-[10px]">
              <div className="flex items-center justify-between py-[3px]">
                <span className="text-[11px] text-[#555]">
                  Items ({totalItems})
                </span>
                <span className="text-[11px] text-[#1a1a1a]">
                  Rs. {itemsTotal}
                </span>
              </div>
              <div className="flex items-center justify-between py-[3px]">
                <span className="text-[11px] text-[#555]">
                  GST
                </span>
                <span className="text-[11px] text-[#1a1a1a]">
                  Rs. {gstValue}
                </span>
              </div>
              <div className="flex items-center justify-between py-[3px]">
                <span className="text-[11px] text-[#555]">
                  Shipping
                </span>
                <span
                  className={`text-[11px] ${
                    shippingValue === "Free"
                      ? "font-medium text-[#1a1a1a]"
                      : "text-[#1a1a1a]"
                  }`}
                >
                  {shippingValue}
                </span>
              </div>
              <div className="my-[6px] h-px bg-[#eedede]" />
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#7a1a2e]">
                  Grand total
                </span>
                <span className="text-[16px] font-bold text-[#7a1a2e]">
                  Rs. {order.totalAmount}
                </span>
              </div>
            </div>

            <div className="mb-[10px] flex items-center gap-2 rounded-[8px] border border-[#b8e0b8] bg-[#f0faf0] px-3 py-[9px]">
              <span className="h-2 w-2 rounded-full bg-[#2d7a2d]" />
              <span className="text-[11px] font-medium text-[#2d7a2d]">
                Express delivery
              </span>
              <span className="ml-auto text-[10px] text-[#2d7a2d]">
                {deliveryDateLabel ? `by ${deliveryDateLabel}` : ""}
              </span>
            </div>
          </section>

          <div className="flex gap-[7px]">
            <button
              onClick={() => router.push(`/orders/${order._id}`)}
              className="flex-1 rounded-[10px] border-[1.5px] border-[#d4a0a0] bg-[#f5eaea] px-[20px] py-[12px] text-center text-[11px] font-semibold text-[#7a1a2e] transition-colors duration-200"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <span>View order tracking</span>
                <ArrowRight size={14} />
              </span>
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex-1 rounded-[10px] bg-[#7a1a2e] px-[20px] py-[12px] text-center text-[11px] font-semibold text-white transition-colors duration-200"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Home size={14} />
                <span>Continue shopping</span>
              </span>
            </button>
          </div>

          <button
            onClick={() => router.push("/orders")}
            className="mt-4 w-full py-2 text-center text-[11px] font-medium text-[#7a1a2e] transition-colors hover:underline"
          >
            View All My Orders {"->"}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
