export const paymentFailedTemplate = (paymentData: {
  customerName: string;
  orderId: string;
  amount: number;
  reason: string;
  retryLink: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header with Alert -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">✕</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Payment Failed</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Don't worry, we can help you!</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${paymentData.customerName},
          </p>
          <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
            Unfortunately, your payment could not be processed. Here are the details:
          </p>

          <!-- Error Details -->
          <div style="background-color: #fff5f5; border-left: 4px solid #dc3545; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <table style="width: 100%; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f0d0d0;">
                <td style="padding: 10px 0; font-weight: 600; color: #666; width: 40%;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">#${paymentData.orderId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0d0d0;">
                <td style="padding: 10px 0; font-weight: 600; color: #666;">Amount:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #333;">₹${paymentData.amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #666; vertical-align: top;">Reason:</td>
                <td style="padding: 10px 0; font-weight: 500; color: #dc3545;">${paymentData.reason}</td>
              </tr>
            </table>
          </div>

          <!-- Common Reasons -->
          <h3 style="margin: 20px 0 15px 0; font-size: 14px; font-weight: bold; color: #333;">Common Reasons for Payment Failure:</h3>
          <ul style="margin: 0 0 30px 0; padding-left: 20px; font-size: 13px; color: #666;">
            <li style="margin-bottom: 8px;">Insufficient funds in your account</li>
            <li style="margin-bottom: 8px;">Incorrect card or UPI details</li>
            <li style="margin-bottom: 8px;">Card expired or temporarily blocked by bank</li>
            <li style="margin-bottom: 8px;">Network or server connectivity issue</li>
            <li>Daily transaction limit exceeded</li>
          </ul>

          <!-- Retry Section -->
          <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #004085;">🔄 Retry Your Payment</h3>
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #004085;">
              Please try again with a different payment method or card. Your order will be reserved for 24 hours.
            </p>
            <a href="${paymentData.retryLink}" style="display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
              Retry Payment Now
            </a>
          </div>

          <!-- Tips -->
          <h3 style="margin: 20px 0 15px 0; font-size: 14px; font-weight: bold; color: #333;">💡 Try These Tips:</h3>
          <ul style="margin: 0 0 30px 0; padding-left: 20px; font-size: 13px; color: #666;">
            <li style="margin-bottom: 8px;">Contact your bank to ensure the payment wasn't blocked</li>
            <li style="margin-bottom: 8px;">Try a different payment method</li>
            <li style="margin-bottom: 8px;">Clear your browser cache and try again</li>
            <li>Wait a few minutes and retry the payment</li>
          </ul>

          <!-- Support -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              ❓ Still having issues? Email us at <strong>support@ewaraofficial.com</strong> or call <strong>+91-XXXXXXXXXX</strong>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p style="margin: 0 0 8px 0;">© 2026 ${process.env.BUSINESS_NAME}. All rights reserved.</p>
          <p style="margin: 0;">We're here to help!</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
