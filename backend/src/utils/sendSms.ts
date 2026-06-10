type SmsOptions = {
  to: string;
  body: string;
};

const sendSms = async ({ to, body }: SmsOptions) => {
  const userId = process.env.GUPSHUP_USER_ID?.trim();
  const password = process.env.GUPSHUP_PASSWORD?.trim();
  const senderId = process.env.GUPSHUP_SENDER_ID?.trim();
  const principalEntityId = process.env.GUPSHUP_PRINCIPAL_ENTITY_ID?.trim();
  const dltTemplateId = process.env.GUPSHUP_DLT_TEMPLATE_ID?.trim();
  const endpoint =
    process.env.GUPSHUP_SMS_ENDPOINT?.trim() ||
    "https://enterprise.smsgupshup.com/GatewayAPI/rest";

  if (!userId || !password) {
    throw new Error(
      "SMS provider not configured. Set GUPSHUP_USER_ID and GUPSHUP_PASSWORD."
    );
  }

  const digitsOnly = String(to || "").replace(/[^\d]/g, "");
  if (!digitsOnly) {
    throw new Error("SMS recipient number is required.");
  }

  const formData = new URLSearchParams();
  formData.append("userid", userId);
  formData.append("password", password);
  formData.append("send_to", digitsOnly);
  formData.append("msg", body);
  formData.append("v", "1.1");
  formData.append("method", "sendMessage");
  formData.append("format", "text");
  formData.append("auth_scheme", "plain");
  formData.append("msg_type", "text");

  if (senderId) {
    formData.append("mask", senderId);
  }

  if (principalEntityId) {
    formData.append("principalEntityId", principalEntityId);
  }

  if (dltTemplateId) {
    formData.append("dltTemplateId", dltTemplateId);
  }

  const response = await fetch(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }
  );

  const responseText = await response.text();

  if (!response.ok || !/success/i.test(responseText)) {
    throw new Error(`SMS delivery failed: ${responseText}`);
  }

  return { raw: responseText };
};

export default sendSms;
