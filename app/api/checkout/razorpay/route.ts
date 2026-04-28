import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { errorResponse, successResponse } from "../../_lib/response";

const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

const isConfiguredRazorpayKey = (value: string) =>
  Boolean(value) && !value.includes("YOUR_KEY");

export async function POST(request: NextRequest) {
  try {
    if (
      !isConfiguredRazorpayKey(razorpayKeyId) ||
      !isConfiguredRazorpayKey(razorpayKeySecret)
    ) {
      return errorResponse(
        "Razorpay is not configured. Add valid NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET values.",
        500
      );
    }

    const { items, customerEmail, customerPhone, total, totalAmount } =
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
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
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
