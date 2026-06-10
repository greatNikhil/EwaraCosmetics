export const orderConfirmationTemplate = (
  orderData: {
    orderId: string;
    customerName: string;
    email: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image: string;
    }>;
    totalAmount: number;
    shippingAddress: any;
    paymentMethod: string;
  }
) => {
  const supportEmail =
    process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@ewaraofficial.com";

  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 12px; text-align: left;">
        <p style="margin: 0; font-weight: 500;">${item.name}</p>
      </td>
      <td style="padding: 12px; text-align: center;">
        <p style="margin: 0;">${item.quantity}</p>
      </td>
      <td style="padding: 12px; text-align: right;">
        <p style="margin: 0; font-weight: 500;">₹${item.price}</p>
      </td>
      <td style="padding: 12px; text-align: right;">
        <p style="margin: 0; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
      </td>
    </tr>
  `
    )
    .join("");

  const shippingInfo = orderData.shippingAddress || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">EWARA</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Order Confirmation</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <!-- Greeting -->
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${orderData.customerName},
          </p>
          <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
            Thank you for your order! We've received your order and it's being processed. Here are your order details:
          </p>

          <!-- Order Details Box -->
          <div style="background-color: #f5f5f5; border-left: 4px solid #7a1f2b; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600;">Order Number</p>
            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #7a1f2b;">#${orderData.orderId}</p>
            
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600;">Order Date</p>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #333;">${new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>

            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600;">Payment Method</p>
            <p style="margin: 0; font-size: 14px; color: #333;">${orderData.paymentMethod}</p>
          </div>

          <!-- Items Table -->
          <h3 style="margin: 30px 0 15px 0; font-size: 16px; font-weight: bold; color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 12px; color: #666; text-transform: uppercase;">Product</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 12px; color: #666; text-transform: uppercase;">Name</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 12px; color: #666; text-transform: uppercase;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 12px; color: #666; text-transform: uppercase;">Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 12px; color: #666; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Price Summary -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Subtotal:</span>
              <span style="font-weight: 500;">₹${orderData.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Shipping:</span>
              <span style="font-weight: 500; color: #7a1f2b;">FREE</span>
            </div>
            <div style="border-top: 1px solid #ddd; padding-top: 10px; display: flex; justify-content: space-between;">
              <span style="font-weight: bold;">Total Amount:</span>
              <span style="font-size: 18px; font-weight: bold; color: #7a1f2b;">₹${orderData.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <h3 style="margin: 30px 0 15px 0; font-size: 16px; font-weight: bold; color: #333;">Shipping Address</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 30px; font-size: 14px;">
            <p style="margin: 0 0 5px 0; font-weight: 500;">${shippingInfo.fullName || 'N/A'}</p>
            <p style="margin: 0 0 5px 0; color: #666;">${shippingInfo.addressLine1 || ''}</p>
            ${shippingInfo.addressLine2 ? `<p style="margin: 0 0 5px 0; color: #666;">${shippingInfo.addressLine2}</p>` : ''}
            <p style="margin: 0 0 5px 0; color: #666;">${shippingInfo.city || ''}, ${shippingInfo.state || ''} ${shippingInfo.postalCode || ''}</p>
            <p style="margin: 0; color: #666;">📱 ${shippingInfo.phoneNumber || 'N/A'}</p>
          </div>

          <!-- Info Box -->
          <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 13px; color: #004085;">
              ℹ️ <strong>Next Step:</strong> Our team will process your order shortly. You'll receive a shipping confirmation email with tracking details once your order ships.
            </p>
          </div>

          <!-- FAQ -->
          <h3 style="margin: 30px 0 15px 0; font-size: 14px; font-weight: bold; color: #333;">Need Help?</h3>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
            📧 <strong>Email:</strong> ${supportEmail}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
            📞 <strong>Phone:</strong> +91-XXXXXXXXXX
          </p>
          <p style="margin: 0; font-size: 13px; color: #666;">
            🌐 Visit our <a href="https://ewara.com" style="color: #7a1f2b; text-decoration: none;">website</a> for more info.
          </p>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p style="margin: 0 0 8px 0;">© 2026 ${process.env.BUSINESS_NAME}. All rights reserved.</p>
          <p style="margin: 0;">This is an automated email. Please do not reply directly.</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
