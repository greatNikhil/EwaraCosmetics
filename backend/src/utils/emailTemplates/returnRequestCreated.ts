export const returnRequestCreatedTemplate = (data: {
  customerName: string;
  orderId: string;
  productName: string;
  reason: string;
  requestDate: string;
  requestId: string;
}) => {
  const primaryColor = "#7a1f2b";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@ewaraofficial.com";
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
        <div style="background: linear-gradient(135deg, ${primaryColor} 0%, #5c1721 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Return Request Received</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">Request ID: #${data.requestId}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; margin: 0 0 20px 0; color: #333;">Hi ${data.customerName},</p>
          
          <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 25px;">
            Thank you for submitting a return request. We've received your request to return <strong>${data.productName}</strong> from order <strong>#${data.orderId}</strong>. We'll process your return and arrange a refund as quickly as possible.
          </p>

          <!-- Details Box -->
          <div style="background-color: #f5f5f5; border-left: 4px solid ${primaryColor}; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999; text-transform: uppercase; font-weight: 600;">Return Details</p>
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
                <td style="padding: 6px 0;"><strong>Product:</strong></td>
                <td style="text-align: right;">${data.productName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Return Reason:</strong></td>
                <td style="text-align: right;">${data.reason}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Submitted:</strong></td>
                <td style="text-align: right;">${data.requestDate}</td>
              </tr>
            </table>
          </div>

          <!-- Return Process -->
          <div style="background-color: #fff5f5; border: 1px solid #ffd9d9; border-radius: 4px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #8b2e2e;">Return Process</p>
            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
              <li>Our team will review your return request within 24 hours</li>
              <li>If approved, you'll receive a return shipping label via email</li>
              <li>Pack the item securely and use the provided label</li>
              <li>Once we receive and inspect the item, your refund will be processed</li>
            </ul>
          </div>

          <div style="background-color: #f0f8ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin-bottom: 25px; font-size: 13px; color: #005a87; line-height: 1.6;">
            <strong>Important:</strong> Items must be returned in original condition with all packaging and accessories. Returns initiated after 30 days of purchase may not be eligible for refund.
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.8;">
            Questions about your return? Reach out to our support team anytime. We're committed to making the process smooth for you.
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
