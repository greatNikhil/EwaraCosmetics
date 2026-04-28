import { NextRequest } from "next/server";
import Stripe from "stripe";
import { errorResponse, successResponse } from "../../_lib/response";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return errorResponse("Missing signature or secret", 400);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return errorResponse("Invalid signature", 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.info("Stripe payment successful for:", session.customer_email);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.info("Stripe PaymentIntent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error("Stripe payment failed:", failedPayment.id);
        break;
      }

      default:
        console.info(`Unhandled event type: ${event.type}`);
    }

    return successResponse("Stripe webhook processed", {
      received: true,
      eventType: event.type,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return errorResponse("Webhook processing failed", 500);
  }
}
