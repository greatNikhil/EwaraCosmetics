const termsSections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using the Ewara website, placing an order, creating an account, or communicating with us through our platform, you agree to these Terms & Conditions.",
      "If you do not agree with these terms, please do not use the website or complete a purchase.",
    ],
  },
  {
    title: "2. Business Overview",
    body: [
      "Ewara offers beauty, skincare, self-care, fragrance, and related products through its online platform. Product listings, offers, categories, and pricing may change from time to time based on availability, promotions, and business needs.",
    ],
  },
  {
    title: "3. Account Responsibility",
    body: [
      "Customers are responsible for maintaining accurate account information, including name, email, phone number, and delivery address.",
      "You are also responsible for maintaining the confidentiality of your login credentials and for all actions carried out through your account.",
    ],
  },
  {
    title: "4. Product Information",
    body: [
      "We aim to display product names, descriptions, pricing, stock status, and images as accurately as possible. However, slight variations in packaging, color representation, and presentation may occur.",
      "Product availability is subject to stock at the time the order is processed.",
    ],
  },
  {
    title: "5. Pricing and Payments",
    body: [
      "All prices displayed on the website are subject to change without prior notice. Applicable taxes, delivery charges, or COD charges may be added during checkout where relevant.",
      "Orders are confirmed only after successful payment authorization or successful placement of an approved payment method such as Cash on Delivery where available.",
    ],
  },
  {
    title: "6. Orders and Cancellation",
    body: [
      "Ewara reserves the right to cancel or refuse any order in cases including but not limited to pricing errors, stock unavailability, suspicious activity, incomplete customer details, or payment verification issues.",
      "If an eligible paid order is cancelled by us before dispatch, the applicable refund will be initiated through the original payment method or as otherwise communicated.",
    ],
  },
  {
    title: "7. Shipping and Delivery",
    body: [
      "Delivery timelines are estimates and may vary depending on service location, logistics conditions, public holidays, operational delays, or circumstances beyond our reasonable control.",
      "Customers must provide a complete and accurate delivery address. Ewara is not responsible for delays or failed deliveries caused by incorrect or incomplete address details provided by the customer.",
    ],
  },
  {
    title: "8. Returns, Refunds, and Replacements",
    body: [
      "Return, replacement, and refund requests are subject to Ewara's applicable return policy, hygiene considerations, product condition, and verification by our support team.",
      "Products that are damaged, used, tampered with, or not eligible under the applicable return criteria may be declined for refund or replacement.",
    ],
  },
  {
    title: "9. Customer Conduct",
    body: [
      "Users must not misuse the website, interfere with platform security, submit false information, attempt unauthorized access, exploit vulnerabilities, or place fraudulent orders.",
      "Ewara may suspend access, cancel orders, or take other appropriate action where misuse or abuse is reasonably detected.",
    ],
  },
  {
    title: "10. Intellectual Property",
    body: [
      "All content on the Ewara website, including branding, text, design elements, graphics, and original website content, is owned by or licensed to Ewara unless otherwise stated.",
      "No part of the website may be copied, republished, distributed, or commercially exploited without prior written permission.",
    ],
  },
  {
    title: "11. Limitation of Liability",
    body: [
      "Ewara is not liable for indirect, incidental, special, or consequential losses arising from website use, delays, interruptions, third-party service failures, or product misuse, to the extent permitted by applicable law.",
      "Nothing in these terms is intended to exclude any legal rights that cannot lawfully be excluded.",
    ],
  },
  {
    title: "12. Privacy",
    body: [
      "Your use of the platform is also governed by the Ewara Privacy Policy, which explains how personal information is collected, used, and protected.",
    ],
  },
  {
    title: "13. Updates to Terms",
    body: [
      "We may revise these Terms & Conditions from time to time. Continued use of the website after updates are published means you accept the revised terms.",
    ],
  },
  {
    title: "14. Contact Information",
    body: [
      "For order-related assistance, policy questions, or customer support, please contact Ewara at support@ewaraofficial.com or call +91 8545055656.",
    ],
  },
];

export default function TermsConditionsPage() {
  return (
    <section className="bg-[#fcf8f3] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#eadfd5] bg-white p-6 shadow-[0_18px_50px_rgba(53,39,28,0.06)] md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8f7a68]">
          Policies
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-[#30231d] md:text-5xl">
          Terms & Conditions
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7b6c61] md:text-base">
          Last updated: June 13, 2026. These terms describe the rules for using
          the Ewara website, placing orders, making payments, and interacting
          with our products and services.
        </p>

        <div className="mt-8 space-y-8">
          {termsSections.map((section) => (
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
