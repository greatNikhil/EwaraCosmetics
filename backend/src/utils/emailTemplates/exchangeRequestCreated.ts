export const exchangeRequestCreatedTemplate = (data: {
  customerName: string;
  orderId: string;
  productName: string;
  reason: string;
  requestDate: string;
  requestId: string;
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
        <div style="background: linear-gradient(135deg, ${primaryColor} 0%, #5c1721 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Exchange Request Received</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">Request ID: #${data.requestId}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; margin: 0 0 20px 0; color: #333;">Hi ${data.customerName},</p>
          
          <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 25px;">
            Thank you for submitting an exchange request. We've received your request to exchange <strong>${data.productName}</strong> from order <strong>#${data.orderId}</strong>.
          </p>

          <!-- Details Box -->
          <div style="background-color: #f5f5f5; border-left: 4px solid ${primaryColor}; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999; text-transform: uppercase; font-weight: 600;">Request Details</p>
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
                <td style="padding: 6px 0;"><strong>Reason:</strong></td>
                <td style="text-align: right;">${data.reason}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Submitted:</strong></td>
                <td style="text-align: right;">${data.requestDate}</td>
              </tr>
            </table>
          </div>

          <!-- What's Next -->
          <div style="background-color: #f0f8ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #005a87;">What happens next?</p>
            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
              <li>Our team will review your exchange request within 24 hours</li>
              <li>You'll receive an email confirmation with next steps</li>
              <li>If approved, we'll arrange for pickup or provide a return label</li>
              <li>Your replacement product will be shipped once we receive the original item</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.8; margin-bottom: 25px;">
            If you have any questions about your exchange request, please don't hesitate to contact us. We're here to help!
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">Need assistance?</p>
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
