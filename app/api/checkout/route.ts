import { NextRequest } from "next/server";
import Stripe from "stripe";
import { errorResponse, successResponse } from "../_lib/response";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail } = await request.json();

    if (!items || items.length === 0) {
      return errorResponse("No items in cart", 400);
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        items: JSON.stringify(items),
      },
    });

    return successResponse(
      "Stripe checkout session created",
      {
        sessionId: session.id,
        url: session.url,
      },
      200
    );
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return errorResponse(error.message || "Checkout failed", 500);
  }
}
