const policySections = [
  {
    title: "1. Information We Collect",
    body: [
      "When you browse, create an account, place an order, contact support, or subscribe to updates, Ewara may collect your name, email address, phone number, delivery address, billing details, order history, and any information you voluntarily share with us.",
      "We may also collect technical information such as device type, browser type, IP address, pages visited, and on-site activity to improve store performance and customer experience.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "We use your information to process orders, manage deliveries, provide order updates, respond to support requests, improve our website, prevent misuse, and maintain account security.",
      "Your contact details may also be used for service-related messages such as order confirmation, payment updates, shipping updates, password recovery, and essential account communication.",
    ],
  },
  {
    title: "3. Payments and Transaction Data",
    body: [
      "Payments on Ewara are processed through third-party payment partners. We do not intentionally store full card details on our website.",
      "Transaction-related information such as payment status, order value, and reference IDs may be stored to verify purchases, manage refunds, and prevent fraud.",
    ],
  },
  {
    title: "4. Address and Delivery Information",
    body: [
      "Saved addresses are used only for order fulfillment, delivery coordination, and customer convenience during checkout.",
      "Your address data remains associated with your account until you update or delete it through your profile, subject to any legal or operational retention required for completed orders.",
    ],
  },
  {
    title: "5. Sharing of Information",
    body: [
      "We may share relevant customer information with logistics partners, payment gateways, technology providers, and service vendors only to the extent required to operate the business and fulfill your orders.",
      "We do not sell your personal information to unrelated third parties for their independent marketing purposes.",
    ],
  },
  {
    title: "6. Cookies and Analytics",
    body: [
      "Ewara may use cookies, local storage, and similar tools to maintain sessions, remember preferences, support cart and wishlist functionality, and understand how visitors use the website.",
      "You can manage cookies through your browser settings, but some features of the website may not work properly if essential cookies are disabled.",
    ],
  },
  {
    title: "7. Data Security",
    body: [
      "We use reasonable technical and operational measures to protect customer information from unauthorized access, misuse, or loss.",
      "However, no digital platform can guarantee absolute security, so customers should also protect their account credentials and avoid sharing login details with others.",
    ],
  },
  {
    title: "8. Your Rights and Choices",
    body: [
      "You may review and update your profile and saved address information through your account. You may also contact us if you need help correcting or removing account information that you can no longer access directly.",
      "We may retain certain transaction records, invoices, and support history where required for compliance, fraud prevention, dispute resolution, or internal record keeping.",
    ],
  },
  {
    title: "9. Children’s Privacy",
    body: [
      "Ewara is not intended for use by children without parental or guardian involvement. We do not knowingly collect personal information from children in violation of applicable law.",
    ],
  },
  {
    title: "10. Policy Updates",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our operations, legal requirements, or platform features. Updated versions will be posted on this page with the latest revision date.",
    ],
  },
  {
    title: "11. Contact Us",
    body: [
      "For privacy-related questions, account support, or data requests, please contact Ewara at info@ewaraofficial.com or call 8545055656.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-[#fcf8f3] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#eadfd5] bg-white p-6 shadow-[0_18px_50px_rgba(53,39,28,0.06)] md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8f7a68]">
          Policies
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-[#30231d] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7b6c61] md:text-base">
          Last updated: April 25, 2026. This policy explains how Ewara collects,
          uses, stores, and protects customer information across the website,
          checkout flow, support channels, and account features.
        </p>

        <div className="mt-8 space-y-8">
          {policySections.map((section) => (
            <div key={section.title} className="rounded-[22px] border border-[#f1e8de] bg-[#fffcf8] p-5 md:p-6">
              <h2 className="text-lg font-medium text-[#30231d] md:text-xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-[#6f6158] md:text-[15px]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
