export const orderDeliveredTemplate = (deliveryData: {
  customerName: string;
  orderId: string;
  deliveryDate: string;
  feedbackLink: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #20c997 0%, #1aa179 100%); color: white; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Your Order is Delivered!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Thank you for your purchase</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${deliveryData.customerName},
          </p>
          <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
            Your order has been successfully delivered! We hope you enjoy your purchase. Please take a moment to share your feedback.
          </p>

          <!-- Delivery Confirmation -->
          <div style="background-color: #f0f8f5; border-left: 4px solid #20c997; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <table style="width: 100%; font-size: 14px;">
              <tr style="border-bottom: 1px solid #c8e6c9;">
                <td style="padding: 10px 0; font-weight: 600; color: #1b5e20; width: 40%;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">#${deliveryData.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #1b5e20;">Delivered On:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">📅 ${deliveryData.deliveryDate}</td>
              </tr>
            </table>
          </div>

          <!-- Feedback Section -->
          <h3 style="margin: 20px 0 15px 0; font-size: 16px; font-weight: bold; color: #333;">Your Opinion Matters!</h3>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666;">
            We'd love to hear about your experience. Your feedback helps us serve you better and helps other customers make informed decisions.
          </p>

          <!-- Rate & Review Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${deliveryData.feedbackLink}" style="display: inline-block; background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
              ⭐ Rate & Review
            </a>
          </div>

          <!-- Why Your Feedback Matters -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              💡 Your honest review helps us improve our products and services. Every feedback counts!
            </p>
          </div>

          <!-- What's Next -->
          <h3 style="margin: 20px 0 15px 0; font-size: 14px; font-weight: bold; color: #333;">What's Next?</h3>
          <ul style="margin: 0 0 30px 0; padding-left: 20px; font-size: 13px; color: #666;">
            <li style="margin-bottom: 8px;">Check out our latest collection of products</li>
            <li style="margin-bottom: 8px;">Subscribe to our newsletter for exclusive offers</li>
            <li>Refer a friend and earn rewards</li>
          </ul>

          <!-- Continue Shopping Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://ewara.com/shop" style="display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 10px 25px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; margin-right: 10px;">
              Continue Shopping
            </a>
            <a href="https://ewara.com/wishlist" style="display: inline-block; background: #f5f5f5; color: #333; padding: 10px 25px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; border: 1px solid #ddd;">
              View Wishlist
            </a>
          </div>

          <!-- Support -->
          <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #1b5e20;">
              ❓ Not satisfied? Our <strong>Easy Return Policy</strong> allows returns within 30 days. Contact us at <strong>support@ewaraofficial.com</strong>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p style="margin: 0 0 8px 0;">© 2026 ${process.env.BUSINESS_NAME}. All rights reserved.</p>
          <p style="margin: 0;">Thanks for shopping with us!</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
