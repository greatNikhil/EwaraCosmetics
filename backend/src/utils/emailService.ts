import sendEmail from "./sendEmail";
import { orderConfirmationTemplate } from "./emailTemplates/orderConfirmation";
import { paymentSuccessTemplate } from "./emailTemplates/paymentSuccess";
import { paymentFailedTemplate } from "./emailTemplates/paymentFailed";
import { orderShippedTemplate } from "./emailTemplates/orderShipped";
import { orderDeliveredTemplate } from "./emailTemplates/orderDelivered";
import { passwordResetTemplate } from "./emailTemplates/passwordReset";
import { promotionalEmailTemplate } from "./emailTemplates/promotionalEmail";

const BUSINESS_NAME = process.env.BUSINESS_NAME || "Ewara Fashion pvt. ltd.";
const BUSINESS_EMAIL = process.env.EMAIL_FROM || "info@ewaraofficial.com";

// ============================================
// 1. ORDER CONFIRMATION EMAIL
// ============================================
export const sendOrderConfirmationEmail = async (
  customerEmail: string,
  orderData: any
) => {
  try {
    const htmlContent = orderConfirmationTemplate({
      orderId: orderData._id || orderData.orderId,
      customerName: orderData.customerName || "Valued Customer",
      email: customerEmail,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || "COD",
    });

    await sendEmail(
      customerEmail,
      `📦 Order Confirmation - #${orderData._id || orderData.orderId} - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Order confirmation email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error(
      "❌ Error sending order confirmation email:",
      error.message
    );
  }
};

// ============================================
// 2. PAYMENT SUCCESS EMAIL
// ============================================
export const sendPaymentSuccessEmail = async (
  customerEmail: string,
  paymentData: {
    customerName: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    date?: string;
  }
) => {
  try {
    const htmlContent = paymentSuccessTemplate({
      ...paymentData,
      date:
        paymentData.date ||
        new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    });

    await sendEmail(
      customerEmail,
      `✅ Payment Successful - Order #${paymentData.orderId} - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Payment success email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending payment success email:", error.message);
  }
};

// ============================================
// 3. PAYMENT FAILED EMAIL
// ============================================
export const sendPaymentFailedEmail = async (
  customerEmail: string,
  paymentData: {
    customerName: string;
    orderId: string;
    amount: number;
    reason: string;
    retryLink: string;
  }
) => {
  try {
    const htmlContent = paymentFailedTemplate(paymentData);

    await sendEmail(
      customerEmail,
      `❌ Payment Failed - Order #${paymentData.orderId} - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Payment failed email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending payment failed email:", error.message);
  }
};

// ============================================
// 4. ORDER SHIPPED EMAIL
// ============================================
export const sendOrderShippedEmail = async (
  customerEmail: string,
  shippingData: {
    customerName: string;
    orderId: string;
    trackingNumber: string;
    trackingUrl: string;
    estimatedDelivery: string;
    carrier: string;
  }
) => {
  try {
    const htmlContent = orderShippedTemplate(shippingData);

    await sendEmail(
      customerEmail,
      `📦 Your Order Shipped - Track #${shippingData.trackingNumber} - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Order shipped email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending order shipped email:", error.message);
  }
};

// ============================================
// 5. ORDER DELIVERED EMAIL
// ============================================
export const sendOrderDeliveredEmail = async (
  customerEmail: string,
  deliveryData: {
    customerName: string;
    orderId: string;
    deliveryDate: string;
    feedbackLink: string;
  }
) => {
  try {
    const htmlContent = orderDeliveredTemplate(deliveryData);

    await sendEmail(
      customerEmail,
      `🎉 Order Delivered - Order #${deliveryData.orderId} - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Order delivered email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending order delivered email:", error.message);
  }
};

// ============================================
// 6. PASSWORD RESET EMAIL
// ============================================
export const sendPasswordResetEmail = async (
  customerEmail: string,
  resetData: {
    customerName: string;
    resetLink: string;
    expiryTime: string;
  }
) => {
  try {
    const htmlContent = passwordResetTemplate(resetData);

    await sendEmail(
      customerEmail,
      `🔐 Reset Your Password - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Password reset email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending password reset email:", error.message);
  }
};

// ============================================
// 7. PROMOTIONAL EMAIL
// ============================================
export const sendPromotionalEmail = async (
  customerEmail: string,
  promoData: {
    customerName: string;
    title: string;
    content: string;
    ctaText: string;
    ctaLink: string;
    imageUrl?: string;
    discount?: string;
    expiryDate?: string;
  }
) => {
  try {
    const htmlContent = promotionalEmailTemplate(promoData);

    await sendEmail(
      customerEmail,
      `🎊 ${promoData.title} - ${BUSINESS_NAME}`,
      htmlContent
    );

    console.log(`✅ Promotional email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending promotional email:", error.message);
  }
};

// ============================================
// 8. WELCOME EMAIL (BONUS)
// ============================================
export const sendWelcomeEmail = async (
  customerEmail: string,
  customerName: string
) => {
  try {
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to ${BUSINESS_NAME}!</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Welcome to our family! We're thrilled to have you join us. 
              Explore our premium collection of cosmetics and beauty products.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ewara.com/shop" style="display: inline-block; background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600;">
                Start Shopping
              </a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">
              Use code <strong>WELCOME10</strong> for 10% off your first order!
            </p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            <p style="margin: 0;">© 2026 ${BUSINESS_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      customerEmail,
      `👋 Welcome to ${BUSINESS_NAME}!`,
      welcomeHtml
    );

    console.log(`✅ Welcome email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending welcome email:", error.message);
  }
};

// ============================================
// EXPORT SUMMARY
// ============================================
console.log(`📧 Email Service Initialized for: ${BUSINESS_NAME}`);
console.log(`📬 Sender Email: ${BUSINESS_EMAIL}`);
