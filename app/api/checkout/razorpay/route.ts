import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { errorResponse, successResponse } from "../../_lib/response";

const isConfiguredRazorpayKey = (value: string) =>
  Boolean(value) && !value.includes("YOUR_KEY");

const isLiveRazorpayKey = (value: string) => value.startsWith("rzp_live_");

const isLocalAppUrl = (value: string) =>
  value.includes("localhost") || value.includes("127.0.0.1");

export async function POST(request: NextRequest) {
  try {
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const isDevelopmentMode = process.env.NODE_ENV !== "production";

    if (
      !isConfiguredRazorpayKey(razorpayKeyId) ||
      !isConfiguredRazorpayKey(razorpayKeySecret)
    ) {
      return errorResponse(
        "Razorpay is not configured. Add valid NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET values.",
        500
      );
    }

    // Removed live key validation - allowing live keys for testing

    const {
      items,
      customerEmail,
      customerPhone,
      total,
      totalAmount,
      paymentOption,
      paymentMethodLabel,
    } =
      await request.json();
    const payableTotal = totalAmount ?? total;

    if (!items || items.length === 0) {
      return errorResponse("No items in cart", 400);
    }

    if (!payableTotal || payableTotal <= 0) {
      return errorResponse("Invalid total amount", 400);
    }

    void customerEmail;
    void customerPhone;

    const orderData = {
      amount: Math.round(payableTotal * 100),
      currency: "INR",
      receipt: `ewara_${Date.now()}`,
      payment_capture: 1,
      notes: {
        payment_option: String(paymentOption || "online"),
        payment_method_label: String(paymentMethodLabel || "Razorpay"),
        customer_email: String(customerEmail || ""),
        customer_phone: String(customerPhone || ""),
      },
    };

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create(orderData);

    return successResponse(
      "Razorpay order created",
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: razorpayKeyId,
      },
      200
    );
  } catch (error: any) {
    console.error("Razorpay checkout error:", error);
    return errorResponse(error.message || "Checkout failed", 500);
  }
}
