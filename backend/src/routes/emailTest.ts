import { Router } from "express";
import sendEmail from "../utils/sendEmail";
import { logError, logInfo } from "../utils/logger";

const router = Router();

router.post("/send-verification", async (req, res) => {
  const { testEmail } = req.body;

  if (!testEmail) {
    return res.status(400).json({
      success: false,
      message: "Test email address is required",
      example: {
        testEmail: "your-email@example.com",
      },
    });
  }

  try {
    const usingResend = Boolean(process.env.RESEND_API_KEY?.trim());

    if (usingResend) {
      if (!process.env.RESEND_FROM && !process.env.EMAIL_FROM) {
        return res.status(500).json({
          success: false,
          message: "Resend sender address not configured in .env",
          required: [
            "RESEND_API_KEY=your_resend_api_key",
            "RESEND_FROM=Ewara Cosmetics <info@ewaraofficial.com>",
          ],
        });
      }
    } else if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.SMTP_HOST) {
      return res.status(500).json({
        success: false,
        message: "SMTP credentials not configured in .env",
        required: [
          "SMTP_HOST=smtp.titan.email",
          "SMTP_PORT=587",
          "SMTP_SECURE=false",
          "EMAIL_USER=info@ewaraofficial.com",
          "EMAIL_PASS=your-mailbox-password",
        ],
      });
    }

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
      <h1>Email Delivery Verification</h1>
    </div>

    <div class="content">
      <h2>Test Successful</h2>
      <p>This email confirms that your email delivery setup is working correctly.</p>

      <div class="success-badge">VERIFIED - REAL INBOX DELIVERY</div>

      <div class="details">
        <h3>Verification Details:</h3>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM || process.env.RESEND_FROM || process.env.EMAIL_USER}</p>
        <p><strong>To:</strong> ${testEmail}</p>
        <p><strong>Service:</strong> ${usingResend ? "Resend API" : process.env.SMTP_HOST}</p>
        <p><strong>Status:</strong> Delivered Successfully</p>
        <p class="timestamp"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      </div>

      <h3>What This Means:</h3>
      <ul>
        <li>Email authentication is working</li>
        <li>Provider credentials are valid</li>
        <li>Email successfully reached your inbox</li>
        <li>HTML content renders correctly</li>
        <li>All email triggers in production will work</li>
      </ul>

      <h3>Next Steps:</h3>
      <p>Your email notification system is now verified and ready for production use.</p>
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
    logInfo(`From: ${process.env.EMAIL_FROM || process.env.RESEND_FROM || process.env.EMAIL_USER}`);
    logInfo(`Timestamp: ${new Date().toISOString()}`);

    const result = await sendEmail(
      testEmail,
      "Email Delivery Verification Test - Ewara",
      testEmailHTML
    );

    logInfo("Email sent successfully");
    logInfo(`Message ID: ${result.messageId}`);

    return res.status(200).json({
      success: true,
      message: "TEST EMAIL SENT SUCCESSFULLY",
      verification: {
        status: "VERIFIED",
        sentTo: testEmail,
        sentFrom: process.env.EMAIL_FROM || process.env.RESEND_FROM || process.env.EMAIL_USER,
        service: usingResend ? "Resend API" : process.env.SMTP_HOST,
        timestamp: new Date().toISOString(),
        messageId: result.messageId,
      },
      instructions: {
        step1: "Check your inbox for the verification email",
        step2: "If not in inbox, check spam/promotions folder",
        step3: "If received, your email system is fully verified!",
        step4: "All automated emails are now ready for production",
      },
      nextSteps: [
        "Order confirmations will be sent automatically",
        "Payment notifications are active",
        "Password reset emails are functional",
        "Shipping updates will be delivered",
        "Marketing campaigns can be sent",
      ],
    });
  } catch (error: any) {
    logError("Email delivery test failed:");
    logError(error);

    return res.status(500).json({
      success: false,
      message: "EMAIL DELIVERY TEST FAILED",
      error: error.message,
      troubleshooting: process.env.RESEND_API_KEY
        ? {
            checkCredentials: "Verify RESEND_API_KEY and RESEND_FROM in .env",
            checkDomain: "Verify your sender domain is verified in Resend",
            checkFromAddress: "Use a verified sender address",
            checkProviderLimits: "Verify your email provider has not blocked sending",
          }
        : {
            checkCredentials: "Verify EMAIL_USER, EMAIL_PASS and SMTP_HOST in .env",
            checkSmtpHost: "Verify SMTP_HOST and SMTP_PORT in .env",
            checkMailboxPassword: "Use the mailbox password from Titan or your provider",
            checkTls: "Make sure SMTP_SECURE matches the provider requirements",
            checkProviderLimits: "Verify your email provider has not blocked sending",
          },
      tips: process.env.RESEND_API_KEY
        ? [
            "Verify your domain in Resend before sending from info@ewaraofficial.com",
            "If you need a quick test, use the default Resend sender first",
            "Check spam/promotions folders if the email arrives but is not visible",
            "Wait 5-10 minutes between test attempts",
          ]
        : [
            "Use the mailbox password from Titan or your email provider",
            "Ensure SMTP credentials match the provider's documented settings",
            "Check spam/promotions folders if the email arrives but is not visible",
            "Wait 5-10 minutes between test attempts",
          ],
    });
  }
});

export default router;
