export const refundNotificationTemplate = (data: {
  customerName: string;
  orderId: string;
  refundAmount: number;
  refundMethod: string;
  status: "instant" | "pending";
  processedDate: string;
  estimatedDelivery?: string;
}) => {
  const primaryColor = "#7a1f2b";
  const supportEmail =
    process.env.SUPPORT_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    "support@ewaraofficial.com";
  const companyName = process.env.COMPANY_NAME || "Ewara Fashion";

  const isInstant = data.status === "instant";
  const statusHeading = isInstant ? "Refund Sent" : "Refund Processing";
  const statusMessage = isInstant
    ? "Your refund has been sent to your original payment method and should appear in your account shortly."
    : `Your refund is being processed and will be credited within ${data.estimatedDelivery || "3 business days"}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${primaryColor} 0%, #5c1721 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">${statusHeading}</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">Order #${data.orderId}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; margin: 0 0 20px 0; color: #333;">Hi ${data.customerName},</p>
          
          <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 25px;">
            ${statusMessage}
          </p>

          <!-- Refund Details -->
          <div style="background: linear-gradient(135deg, #f0f8ff 0%, #e8f4ff 100%); border-left: 4px solid #2563eb; padding: 25px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #1a5490; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Refund Summary</p>
            
            <table style="width: 100%; margin-bottom: 16px;">
              <tr>
                <td style="padding: 10px 0; font-size: 14px; color: #333;"><strong>Order ID:</strong></td>
                <td style="text-align: right; font-size: 14px; color: #555;">#${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 14px; color: #333;"><strong>Refund Amount:</strong></td>
                <td style="text-align: right; font-size: 18px; color: #2563eb; font-weight: 600;">₹${Number(data.refundAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 14px; color: #333;"><strong>Refund Method:</strong></td>
                <td style="text-align: right; font-size: 14px; color: #555;">${data.refundMethod}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 14px; color: #333;"><strong>Processed:</strong></td>
                <td style="text-align: right; font-size: 14px; color: #555;">${data.processedDate}</td>
              </tr>
              ${
                data.estimatedDelivery && !isInstant
                  ? `<tr>
                <td style="padding: 10px 0; font-size: 14px; color: #333;"><strong>Est. Credit:</strong></td>
                <td style="text-align: right; font-size: 14px; color: #555;">${data.estimatedDelivery}</td>
              </tr>`
                  : ""
              }
            </table>
          </div>

          <!-- Information Box -->
          <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #666; text-transform: uppercase; font-weight: 600;">Important Information</p>
            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 13px; line-height: 1.8;">
              ${
                data.refundMethod === "Original Payment"
                  ? '<li>Refund will be credited to your original payment method</li>'
                  : ""
              }
              ${
                data.refundMethod === "Bank Transfer"
                  ? '<li>Bank transfer details were sent separately</li>'
                  : ""
              }
              ${
                data.refundMethod === "Store Credit"
                  ? '<li>Store credit has been added to your account and can be used for future purchases</li>'
                  : ""
              }
              <li>Processing times may vary depending on your bank or payment provider</li>
              <li>If the refund doesn't appear within the estimated timeframe, contact us</li>
            </ul>
          </div>

          <!-- FAQ -->
          <div style="background-color: #fffbef; border-left: 4px solid #f39c12; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #7a6b08; text-transform: uppercase; font-weight: 600;">FAQ</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #7a6b08;"><strong>When will I see the refund?</strong></p>
            <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b5d08; line-height: 1.6;">
              ${
                isInstant
                  ? "Instant refunds usually appear within minutes to a few hours."
                  : "Refunds typically appear within 3-5 business days for Razorpay/card payments, and up to 10 days for bank transfers."
              }
            </p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #7a6b08;"><strong>What if I don't see the refund?</strong></p>
            <p style="margin: 0; font-size: 12px; color: #6b5d08; line-height: 1.6;">Please check with your bank or payment provider first, as they may have additional processing times. If you still don't see it after 10 days, contact us immediately.</p>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.8;">
            Thank you for your patience. If you have any questions about your refund, our support team is here to help!
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">Need help?</p>
          <p style="margin: 0; font-size: 13px; color: #666;">
            Email us: <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${supportEmail}</a>
          </p>
          <p style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            © 2026 ${companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
