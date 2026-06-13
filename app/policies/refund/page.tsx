const refundSections = [
  {
    title: "1. Return Eligibility",
    body: [
      "For hygiene and safety reasons, beauty and personal-care products are eligible for return or replacement only when they are unused, unopened, sealed, and in their original packaging.",
      "Return requests should be raised within 7 days of delivery. Products that are opened, used, damaged after delivery, missing original packaging, or returned without required proof may be declined.",
    ],
  },
  {
    title: "2. Damaged, Wrong, or Missing Items",
    body: [
      "If you receive a damaged product, wrong item, expired product, or an incomplete order, contact support within 48 hours of delivery.",
      "Please share your order ID, photos or videos of the package and product, and a short description of the issue so our team can verify and resolve it quickly.",
    ],
  },
  {
    title: "3. Refund Processing",
    body: [
      "Approved refunds are initiated to the original payment method wherever possible. Refund timelines depend on the payment provider and bank, but usually take 5-7 business days after approval.",
      "For Cash on Delivery orders, refunds may be processed through bank transfer, UPI, store credit, or another supported method after customer verification.",
    ],
  },
  {
    title: "4. Replacement and Exchange",
    body: [
      "Replacement or exchange requests are subject to stock availability and product condition verification.",
      "If the requested replacement item is unavailable, our team may offer a refund, store credit, or an alternate product option.",
    ],
  },
  {
    title: "5. Non-Returnable Cases",
    body: [
      "Opened, used, tampered, intentionally damaged, or hygiene-sensitive products are not returnable unless the issue is caused by a wrong, defective, damaged, or expired delivery from our side.",
      "Shipping charges, COD fees, promotional discounts, and gift items may be non-refundable unless required by applicable law or approved by Ewara support.",
    ],
  },
  {
    title: "6. How to Request Help",
    body: [
      "Email support@ewaraofficial.com or call +91 8545055656 with your order ID and issue details.",
      "Our support team will review the request and guide you through pickup, replacement, refund, or any additional verification required.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <section className="bg-[#fcf8f3] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#eadfd5] bg-white p-6 shadow-[0_18px_50px_rgba(53,39,28,0.06)] md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8f7a68]">
          Policies
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-[#30231d] md:text-5xl">
          Refund & Return Policy
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7b6c61] md:text-base">
          Last updated: June 13, 2026. This policy explains how Ewara handles
          return, replacement, exchange, and refund requests for online orders.
        </p>

        <div className="mt-8 space-y-8">
          {refundSections.map((section) => (
            <div
              key={section.title}
              className="rounded-[22px] border border-[#f1e8de] bg-[#fffcf8] p-5 md:p-6"
            >
              <h2 className="text-lg font-medium text-[#30231d] md:text-xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-[#6f6158] md:text-[15px]"
                  >
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
