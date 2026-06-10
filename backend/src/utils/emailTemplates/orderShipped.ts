export const orderShippedTemplate = (shippingData: {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  carrier: string;
}) => {
  const supportEmail =
    process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@ewaraofficial.com";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Shipped</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Your Order is on the Way!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Track your shipment now</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${shippingData.customerName},
          </p>
          <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
            Great news! Your order has been shipped. You can track your package using the details below.
          </p>

          <!-- Shipping Details -->
          <div style="background-color: #f5f5f5; border-left: 4px solid #17a2b8; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <table style="width: 100%; font-size: 14px;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666; width: 40%;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">#${shippingData.orderId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Tracking Number:</td>
                <td style="padding: 10px 0; font-weight: 600; color: #17a2b8; letter-spacing: 1px;">${shippingData.trackingNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Carrier:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">${shippingData.carrier}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Est. Delivery:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">📅 ${shippingData.estimatedDelivery}</td>
              </tr>
            </table>
          </div>

          <!-- Track Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${shippingData.trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 12px 35px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
              📍 Track Your Order
            </a>
          </div>

          <!-- Timeline -->
          <h3 style="margin: 20px 0 15px 0; font-size: 14px; font-weight: bold; color: #333;">Delivery Timeline</h3>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
            <div style="display: flex; margin-bottom: 15px;">
              <div style="width: 30px; text-align: center; font-weight: bold; color: #17a2b8;">✓</div>
              <div style="flex: 1; font-size: 13px;">
                <p style="margin: 0 0 3px 0; font-weight: 600;">Order Shipped</p>
                <p style="margin: 0; color: #999;">Your item is on its way</p>
              </div>
            </div>
            <div style="display: flex; margin-bottom: 15px;">
              <div style="width: 30px; text-align: center; font-weight: bold; color: #ccc;">→</div>
              <div style="flex: 1; font-size: 13px;">
                <p style="margin: 0 0 3px 0; font-weight: 600;">In Transit</p>
                <p style="margin: 0; color: #999;">Expected to reach soon</p>
              </div>
            </div>
            <div style="display: flex;">
              <div style="width: 30px; text-align: center; font-weight: bold; color: #ccc;">→</div>
              <div style="flex: 1; font-size: 13px;">
                <p style="margin: 0 0 3px 0; font-weight: 600;">Out for Delivery</p>
                <p style="margin: 0; color: #999;">Will arrive today/tomorrow</p>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #1b5e20;">📋 Helpful Tips:</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #2e7d32;">
              <li style="margin-bottom: 5px;">Keep your tracking number safe for reference</li>
              <li style="margin-bottom: 5px;">Make sure someone is available to receive the package</li>
              <li>Update your contact details if needed</li>
            </ul>
          </div>

          <!-- Support -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              ❓ Questions about your order? Contact us at <strong>${supportEmail}</strong>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p style="margin: 0 0 8px 0;">© 2026 ${process.env.BUSINESS_NAME}. All rights reserved.</p>
          <p style="margin: 0;">Happy shopping!</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
