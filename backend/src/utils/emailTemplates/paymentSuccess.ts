export const paymentSuccessTemplate = (paymentData: {
  customerName: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
}) => {
  const supportEmail =
    process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@ewaraofficial.com";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header with Success -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Payment Successful!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your payment has been processed</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${paymentData.customerName},
          </p>
          <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
            Great news! Your payment has been successfully processed. Your order is now confirmed and will be prepared for shipment.
          </p>

          <!-- Payment Details -->
          <div style="background-color: #f5f5f5; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <table style="width: 100%; font-size: 14px;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666; width: 40%;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">#${paymentData.orderId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Amount Paid:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">₹${paymentData.amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Payment Method:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">${paymentData.paymentMethod}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Transaction ID:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333; word-break: break-all;">${paymentData.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Date & Time:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">${paymentData.date}</td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #004085;">✓ What's Next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #004085; font-size: 13px;">
              <li style="margin-bottom: 8px;">Your order is being prepared for shipment</li>
              <li style="margin-bottom: 8px;">You'll receive a tracking number via email</li>
              <li>Check your order status anytime in your account</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://ewara.com/orders/${paymentData.orderId}" style="display: inline-block; background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
              View Order Status
            </a>
          </div>

          <!-- Support -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              ❓ Questions? Email us at <strong>${supportEmail}</strong> or call <strong>+91-XXXXXXXXXX</strong>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p style="margin: 0 0 8px 0;">© 2026 ${process.env.BUSINESS_NAME}. All rights reserved.</p>
          <p style="margin: 0;">Thank you for shopping with us!</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
