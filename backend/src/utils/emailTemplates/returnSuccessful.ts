export const returnSuccessfulTemplate = (data: {
  customerName: string;
  orderId: string;
  productName: string;
  requestDate: string;
  requestId: string;
  trackingNumber?: string;
}) => {
  const primaryColor = "#7a1f2b";
  const supportEmail =
    process.env.SUPPORT_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    "support@ewaraofficial.com";
  const companyName = process.env.COMPANY_NAME || "Ewara Fashion";

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
        <div style="background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">✓ Return Approved</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">Your return has been successfully processed</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; margin: 0 0 20px 0; color: #333;">Hi ${data.customerName},</p>
          
          <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 25px;">
            Great news! Your return request for <strong>${data.productName}</strong> from order <strong>#${data.orderId}</strong> has been approved and processed. Here's what you need to know:
          </p>

          <!-- Approval Details -->
          <div style="background-color: #f0f8f4; border-left: 4px solid #27ae60; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #1e8449; text-transform: uppercase; font-weight: 600;">Return Details</p>
            <table style="width: 100%; font-size: 14px; color: #555;">
              <tr>
                <td style="padding: 6px 0;"><strong>Request ID:</strong></td>
                <td style="text-align: right;">#${data.requestId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
                <td style="text-align: right;">#${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Product Returned:</strong></td>
                <td style="text-align: right;">${data.productName}</td>
              </tr>
              ${
                data.trackingNumber
                  ? `<tr>
                <td style="padding: 6px 0;"><strong>Tracking Number:</strong></td>
                <td style="text-align: right;">${data.trackingNumber}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 6px 0;"><strong>Processed:</strong></td>
                <td style="text-align: right;">${data.requestDate}</td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #333;">What happens next?</p>
            <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
              <li>If you haven't already, please ship the item back to us</li>
              <li>Once we receive your return, we'll verify the product condition</li>
              <li>Your refund will be processed and initiated to your original payment method</li>
              <li>Depending on your bank, the refund may take 5-10 business days to appear in your account</li>
            </ol>
          </div>

          <div style="background-color: #fffbef; border-left: 4px solid #f39c12; padding: 15px; border-radius: 4px; margin-bottom: 25px; font-size: 13px; color: #7a6b08; line-height: 1.6;">
            <strong>Note:</strong> If the item doesn't pass our quality check, we may offer a partial refund. You'll be notified of any adjustments before the refund is finalized.
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.8;">
            Thank you for shopping with us! If you have any questions about your return, please don't hesitate to contact our support team.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">Questions?</p>
          <p style="margin: 0; font-size: 13px; color: #666;">
            Contact us: <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${supportEmail}</a>
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
