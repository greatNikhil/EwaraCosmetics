export const passwordResetTemplate = (resetData: {
  customerName: string;
  resetLink: string;
  expiryTime: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">We received your password reset request</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${resetData.customerName},
          </p>
          <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
            We received a request to reset your password. Click the button below to create a new password. This link will expire in ${resetData.expiryTime}.
          </p>

          <!-- Reset Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetData.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
              Reset Password
            </a>
          </div>

          <!-- Info Box -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #856404;">⚠️ Important:</h3>
            <p style="margin: 0; font-size: 13px; color: #856404;">
              This link is only valid for ${resetData.expiryTime}. If it expires, you can request a new password reset from the login page.
            </p>
          </div>

          <!-- Alternative Link -->
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Or Copy This Link:</p>
            <p style="margin: 0; font-size: 12px; word-break: break-all; color: #333; font-family: 'Courier New', monospace; background-color: white; padding: 10px; border-radius: 3px;">
              ${resetData.resetLink}
            </p>
          </div>

          <!-- Security Notice -->
          <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #1b5e20;">🔒 Security Tip:</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #2e7d32;">
              <li style="margin-bottom: 5px;">Never share this link with anyone</li>
              <li style="margin-bottom: 5px;">Create a strong password with mix of letters, numbers & symbols</li>
              <li>Log out from all devices after resetting your password</li>
            </ul>
          </div>

          <!-- Didn't Request This? -->
          <div style="background-color: #fff5f5; border-left: 4px solid #dc3545; padding: 15px; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #721c24;">Didn't Request This?</h3>
            <p style="margin: 0; font-size: 12px; color: #721c24;">
              If you didn't request a password reset, please ignore this email or contact us immediately at <strong>support@ewaraofficial.com</strong>. Your account is safe.
            </p>
          </div>

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
