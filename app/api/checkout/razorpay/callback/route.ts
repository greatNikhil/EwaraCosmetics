import { NextRequest, NextResponse } from "next/server";

const buildRedirectUrl = (request: NextRequest, params: URLSearchParams) => {
  const redirectUrl = new URL("/checkout/razorpay-return", request.url);
  redirectUrl.search = params.toString();
  return redirectUrl;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params = new URLSearchParams();

  const razorpayPaymentId = String(formData.get("razorpay_payment_id") || "");
  const razorpayOrderId = String(formData.get("razorpay_order_id") || "");
  const razorpaySignature = String(formData.get("razorpay_signature") || "");
  const errorCode = String(formData.get("error[code]") || "");
  const errorDescription = String(formData.get("error[description]") || "");

  if (razorpayPaymentId) {
    params.set("razorpay_payment_id", razorpayPaymentId);
  }

  if (razorpayOrderId) {
    params.set("razorpay_order_id", razorpayOrderId);
  }

  if (razorpaySignature) {
    params.set("razorpay_signature", razorpaySignature);
  }

  if (errorCode) {
    params.set("error_code", errorCode);
  }

  if (errorDescription) {
    params.set("error_description", errorDescription);
  }

  return NextResponse.redirect(buildRedirectUrl(request, params), 303);
}
