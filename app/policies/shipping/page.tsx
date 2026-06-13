const shippingSections = [
  {
    title: "1. Service Area",
    body: [
      "Ewara currently ships orders within India through available courier and logistics partners.",
      "Delivery availability, timelines, and charges may vary based on pincode, courier coverage, order value, and product availability.",
    ],
  },
  {
    title: "2. Order Processing",
    body: [
      "Orders are usually processed within 1-2 business days after successful order placement and payment confirmation.",
      "Processing may take longer during sales, holidays, stock checks, payment verification, or operational delays.",
    ],
  },
  {
    title: "3. Estimated Delivery Timeline",
    body: [
      "Most orders are delivered within 3-7 business days after dispatch, depending on the delivery location and courier performance.",
      "Remote locations, high-demand periods, weather disruptions, public holidays, or logistics issues may extend delivery timelines.",
    ],
  },
  {
    title: "4. Shipping Charges",
    body: [
      "Shipping charges, if applicable, are displayed during checkout before payment.",
      "Free shipping may be available on eligible orders above Rs. 699 or as part of promotional campaigns.",
    ],
  },
  {
    title: "5. Tracking and Delivery Updates",
    body: [
      "Once an order is shipped, tracking details may be shared through email, SMS, WhatsApp, or the order page depending on available integrations.",
      "Customers should ensure their email address, phone number, and delivery address are accurate before placing an order.",
    ],
  },
  {
    title: "6. Failed Delivery or Wrong Address",
    body: [
      "Ewara is not responsible for failed or delayed delivery caused by incorrect address, unreachable phone number, repeated delivery failure, or customer unavailability.",
      "If an order is returned to origin due to customer-side delivery failure, reshipping charges may apply.",
    ],
  },
  {
    title: "7. Shipping Support",
    body: [
      "For shipping questions, delayed deliveries, or tracking help, email support@ewaraofficial.com or call +91 8545055656 with your order ID.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <section className="bg-[#fcf8f3] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#eadfd5] bg-white p-6 shadow-[0_18px_50px_rgba(53,39,28,0.06)] md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8f7a68]">
          Policies
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-[#30231d] md:text-5xl">
          Shipping Policy
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7b6c61] md:text-base">
          Last updated: June 13, 2026. This policy explains Ewara's order
          processing, dispatch, shipping, and delivery practices.
        </p>

        <div className="mt-8 space-y-8">
          {shippingSections.map((section) => (
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
