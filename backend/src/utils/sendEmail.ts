import nodemailer from "nodemailer";

type EmailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim() || process.env.EMAIL_FROM?.trim();

  if (resendApiKey) {
    if (!resendFrom) {
      throw new Error(
        "RESEND_FROM or EMAIL_FROM is required when RESEND_API_KEY is set."
      );
    }

    const resendAttachments =
      attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.isBuffer(attachment.content)
          ? attachment.content.toString("base64")
          : attachment.content,
      })) || [];

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to,
        subject,
        html,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend email failed: ${errorText}`);
    }

    const data = await response.json();
    return { messageId: data?.id || "" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    attachments,
  });
};

export default sendEmail;
