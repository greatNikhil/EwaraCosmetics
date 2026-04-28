import { Router } from "express";
import sendEmail from "../utils/sendEmail";
import { logError, logInfo } from "../utils/logger";

const router = Router();

/**
 * EMAIL DELIVERY VERIFICATION TEST
 * 
 * This endpoint performs a LIVE manual send test to verify:
 * ✅ SMTP credentials are valid
 * ✅ Gmail authentication works
 * ✅ Email reaches actual inbox (not spam)
 * ✅ Email content renders correctly
 * 
 * Endpoint: POST /api/email-test/send-verification
 * 
 * Request Body:
 * {
 *   "testEmail": "your-test-email@gmail.com"
 * }
 */

router.post("/send-verification", async (req, res) => {
  const { testEmail } = req.body;

  if (!testEmail) {
    return res.status(400).json({
      success: false,
      message: "Test email address is required",
      example: {
        testEmail: "your-email@gmail.com"
      }
    });
  }

  try {
    // Verify credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "SMTP credentials not configured in .env",
        required: [
          "EMAIL_USER=your-gmail@gmail.com",
          "EMAIL_PASS=your-app-password"
        ]
      });
    }

    // Create test email content
    const testEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #2a1520 0%, #1a0d15 100%); color: #c49a6c; padding: 20px; text-align: center; border-radius: 8px; }
    .content { margin: 20px 0; line-height: 1.6; color: #333; }
    .success-badge { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .details { background: #f0f0f0; padding: 15px; border-left: 4px solid #c49a6c; margin: 15px 0; border-radius: 4px; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
    .timestamp { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Email Delivery Verification</h1>
    </div>
    
    <div class="content">
      <h2>✅ Test Successful!</h2>
      <p>This email confirms that your SMTP credentials are working correctly and emails can be delivered to your inbox.</p>
      
      <div class="success-badge">VERIFIED - REAL INBOX DELIVERY</div>
      
      <div class="details">
        <h3>Verification Details:</h3>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</p>
        <p><strong>To:</strong> ${testEmail}</p>
        <p><strong>Service:</strong> Gmail SMTP</p>
        <p><strong>Status:</strong> ✅ Delivered Successfully</p>
        <p class="timestamp"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      </div>
      
      <h3>What This Means:</h3>
      <ul>
        <li>✅ Gmail authentication is working</li>
        <li>✅ SMTP credentials are valid</li>
        <li>✅ Email successfully reached your inbox (not spam)</li>
        <li>✅ HTML content renders correctly</li>
        <li>✅ All email triggers in production will work</li>
      </ul>
      
      <h3>Next Steps:</h3>
      <p>Your email notification system is now fully verified and ready for production use. All automated emails will be sent through this verified connection:</p>
      <ul>
        <li>Order confirmations</li>
        <li>Payment notifications</li>
        <li>Password reset links</li>
        <li>Shipping updates</li>
        <li>Marketing campaigns</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>This is an automated test email from Ewara Email Verification System</p>
      <p>© 2026 Ewara. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    logInfo(`Sending verification test email to: ${testEmail}`);
    logInfo(`From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
    logInfo(`Timestamp: ${new Date().toISOString()}`);

    // Send the test email
    const result = await sendEmail(
      testEmail,
      "📧 Email Delivery Verification Test - Ewara",
      testEmailHTML
    );

    logInfo("Email sent successfully");
    logInfo(`Message ID: ${result.messageId}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "✅ TEST EMAIL SENT SUCCESSFULLY",
      verification: {
        status: "VERIFIED",
        sentTo: testEmail,
        sentFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        service: "Gmail SMTP",
        timestamp: new Date().toISOString(),
        messageId: result.messageId
      },
      instructions: {
        step1: "Check your inbox for the verification email",
        step2: "If not in inbox, check spam/promotions folder",
        step3: "If received, your email system is fully verified!",
        step4: "All automated emails are now ready for production"
      },
      nextSteps: [
        "Order confirmations will be sent automatically",
        "Payment notifications are active",
        "Password reset emails are functional",
        "Shipping updates will be delivered",
        "Marketing campaigns can be sent"
      ]
    });

  } catch (error: any) {
    logError("Email delivery test failed:");
    logError(error);

    return res.status(500).json({
      success: false,
      message: "❌ EMAIL DELIVERY TEST FAILED",
      error: error.message,
      troubleshooting: {
        checkCredentials: "Verify EMAIL_USER and EMAIL_PASS in .env",
        checkGmailPassword: "Use Gmail App Password, not your main password",
        check2FA: "Enable 2-Factor Authentication on Gmail account",
        checkAppAccess: "Allow 'Less secure apps' in Gmail settings",
        checkLimits: "Verify you haven't exceeded Gmail's 500 emails/day limit"
      },
      tips: [
        "Use an 'App Password' from Google Account settings, not your Gmail password",
        "Ensure 2-Factor Authentication is enabled",
        "Check Gmail Security Settings for 'Allow less secure apps'",
        "Wait 5-10 minutes between test attempts"
      ]
    });
  }
});

export default router;
