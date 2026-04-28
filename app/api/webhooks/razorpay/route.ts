import { NextRequest } from "next/server";
import crypto from "crypto";
import { errorResponse, successResponse } from "../../_lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return errorResponse("Missing signature", 400);
    }

    const hash = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid Razorpay webhook signature");
      return errorResponse("Invalid signature", 400);
    }

    const event = JSON.parse(body);
    console.info(`Razorpay webhook event: ${event.event}`);

    switch (event.event) {
      case "payment.authorized": {
        const authorizedPayment = event.payload.payment.entity;
        console.info("Payment authorized:", {
          paymentId: authorizedPayment.id,
          amount: authorizedPayment.amount,
          status: authorizedPayment.status,
        });
        break;
      }

      case "payment.failed": {
        const failedPayment = event.payload.payment.entity;
        console.error("Payment failed:", {
          paymentId: failedPayment.id,
          amount: failedPayment.amount,
          errorCode: failedPayment.error_code,
          errorDescription: failedPayment.error_description,
        });
        break;
      }

      case "payment.captured": {
        const capturedPayment = event.payload.payment.entity;
        console.info("Payment captured:", {
          paymentId: capturedPayment.id,
          amount: `${capturedPayment.amount / 100} INR`,
          status: capturedPayment.status,
        });
        break;
      }

      case "order.paid": {
        const paidOrder = event.payload.order.entity;
        console.info("Order marked as paid:", {
          orderId: paidOrder.id,
          amount: `${paidOrder.amount / 100} INR`,
          status: paidOrder.status,
        });
        break;
      }

      case "payment.method.issued":
        console.info(
          "Payment method issued:",
          event.payload.payment_method.entity
        );
        break;

      default:
        console.info(`Unhandled event: ${event.event}`);
    }

    console.info("Razorpay webhook processed successfully:", {
      event: event.event,
      timestamp: new Date().toISOString(),
    });

    return successResponse("Razorpay webhook processed", {
      received: true,
      event: event.event,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return errorResponse("Webhook processing failed", 500, {
      details: error.message,
    });
  }
}
