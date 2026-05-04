"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { AlertCircle, Loader2 } from "lucide-react";
import { buildApiUrl } from "@/utils/api";
import { getClientToken } from "@/utils/clientAuth";
import { useCartStore } from "@/store/cartStore";

const PENDING_RAZORPAY_ORDER_PREFIX = "ewara_pending_razorpay_order_";
const FINALIZED_RAZORPAY_ORDER_PREFIX = "ewara_finalized_razorpay_order_";

type PendingOrderPayload = {
  razorpayOrderId: string;
  items: Array<{
    productId: number | string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  totalAmount: number;
  paymentMethod: string;
  couponCode?: string;
};

function RazorpayReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const [message, setMessage] = useState("Finalizing your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const finalizePayment = async () => {
      const razorpayPaymentId = searchParams.get("razorpay_payment_id") || "";
      const razorpayOrderId = searchParams.get("razorpay_order_id") || "";
      const razorpaySignature = searchParams.get("razorpay_signature") || "";
      const failureDescription = searchParams.get("error_description") || "";

      if (failureDescription) {
        setError(failureDescription);
        return;
      }

      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        setError("Payment response is incomplete. Please contact support.");
        return;
      }

      const token = getClientToken();

      if (!token) {
        setError("Login session missing. Please log in again and contact support if payment was deducted.");
        return;
      }

      const finalizedStorageKey = `${FINALIZED_RAZORPAY_ORDER_PREFIX}${razorpayOrderId}`;
      const existingOrderId =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(finalizedStorageKey)
          : null;

      if (existingOrderId) {
        router.replace(`/order-success/${existingOrderId}`);
        return;
      }

      const pendingStorageKey = `${PENDING_RAZORPAY_ORDER_PREFIX}${razorpayOrderId}`;
      const pendingPayloadRaw =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(pendingStorageKey)
          : null;

      if (!pendingPayloadRaw) {
        setError("Payment succeeded but order details were not found in this browser session.");
        return;
      }

      let pendingPayload: PendingOrderPayload;

      try {
        pendingPayload = JSON.parse(pendingPayloadRaw) as PendingOrderPayload;
      } catch {
        setError("Saved payment details could not be read. Please contact support.");
        return;
      }

      try {
        const orderRes = await axios.post(
          buildApiUrl("/api/orders"),
          {
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            items: pendingPayload.items,
            shippingAddress: pendingPayload.shippingAddress,
            totalAmount: pendingPayload.totalAmount,
            paymentMethod: pendingPayload.paymentMethod,
            couponCode: pendingPayload.couponCode,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const createdOrder = orderRes.data?.order;

        if (!orderRes.data?.success || !createdOrder?._id) {
          throw new Error(
            orderRes.data?.message || "Order was not created after payment."
          );
        }

        window.sessionStorage.setItem(finalizedStorageKey, String(createdOrder._id));
        window.sessionStorage.removeItem(pendingStorageKey);
        clearCart();
        setMessage("Payment verified. Redirecting to your order...");
        router.replace(`/order-success/${createdOrder._id}`);
      } catch (requestError: any) {
        console.error("RAZORPAY RETURN ORDER ERROR:", requestError);
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Payment verified but order creation failed."
        );
      }
    };

    finalizePayment();
  }, [clearCart, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--blush-bg)] px-4 py-10">
      <div className="w-full max-w-md rounded-[14px] border border-[var(--blush-border)] bg-[var(--blush-bg)] p-8 text-center">
        {error ? (
          <>
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf0f0]">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mb-3 text-[20px] font-medium text-[var(--blush-dark)]">
              Payment received, action needed
            </h1>
            <p className="mb-6 text-[12px] leading-[1.7] text-[var(--blush-muted)]">
              {error}
            </p>
            <button
              onClick={() => router.push("/orders")}
              className="w-full rounded-[9px] bg-[var(--blush-brand)] px-6 py-3 text-[11px] font-medium text-white transition-colors duration-200"
            >
              Go to My Orders
            </button>
          </>
        ) : (
          <>
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blush-light)]">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--blush-brand)]" />
            </div>
            <h1 className="mb-3 text-[20px] font-medium text-[var(--blush-dark)]">
              Processing payment
            </h1>
            <p className="text-[12px] leading-[1.7] text-[var(--blush-muted)]">
              {message}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function RazorpayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--blush-bg)] px-4 py-10">
          <div className="w-full max-w-md rounded-[14px] border border-[var(--blush-border)] bg-[var(--blush-bg)] p-8 text-center">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blush-light)]">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--blush-brand)]" />
            </div>
            <h1 className="mb-3 text-[20px] font-medium text-[var(--blush-dark)]">
              Processing payment
            </h1>
            <p className="text-[12px] leading-[1.7] text-[var(--blush-muted)]">
              Finalizing your payment...
            </p>
          </div>
        </div>
      }
    >
      <RazorpayReturnContent />
    </Suspense>
  );
}
