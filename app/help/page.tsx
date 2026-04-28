import {
  User,
  ShoppingCart,
  Truck,
  Heart,
  CreditCard,
  RotateCcw,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import HelpCard from "@/components/help/HelpCard";

const helpItems = [
  {
    id: 1,
    title: "How to Login / Register",
    description:
      "Click the profile icon, enter your email or phone, and verify with OTP. New users can register quickly to save preferences.",
    icon: <User size={20} />,
  },
  {
    id: 2,
    title: "How to Place an Order",
    description:
      "Browse products, add to bag, review in cart, and complete checkout with secure payment options.",
    icon: <ShoppingCart size={20} />,
  },
  {
    id: 3,
    title: "How to Track Orders",
    description:
      "Go to your profile, select 'Orders' to view status updates and delivery details in real-time.",
    icon: <Truck size={20} />,
  },
  {
    id: 4,
    title: "Wishlist / Save Items",
    description:
      "Click the heart icon on products to save for later. Access your wishlist anytime from the profile menu.",
    icon: <Heart size={20} />,
  },
  {
    id: 5,
    title: "Payment Methods",
    description:
      "Pay securely with GPay, PhonePe, Paytm, or cards. All transactions are encrypted and protected.",
    icon: <CreditCard size={20} />,
  },
  {
    id: 6,
    title: "Returns & Support",
    description:
      "Easy returns within 30 days. Contact support for assistance with exchanges or any concerns.",
    icon: <RotateCcw size={20} />,
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#ffe9ee] to-[#fdf8f6] text-[#4a2c2a]">
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-4xl font-semibold text-[#4a2c2a] sm:text-5xl">
          Help & Support
        </h1>
        <p className="mt-4 text-lg text-[#5a4f4d]">
          Everything you need to get started and shop with ease
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {helpItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fadeUp"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <HelpCard
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="rounded-3xl bg-[#f7e1e4]/50 p-8 text-center shadow-[0_24px_64px_rgba(122,31,43,0.08)]">
          <h2 className="text-2xl font-semibold text-[#4a2c2a] mb-4">
            Need More Help?
          </h2>
          <p className="text-sm text-[#5a4f4d] mb-6">
            Our support team is here to assist you with any questions or
            concerns.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:info@ewaraofficial.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7a1f2b] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(122,31,43,0.18)] transition duration-300 hover:bg-[#5a1920]"
            >
              <Mail size={16} />
              Email Us
            </a>
            <a
              href="tel:+918545055656"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7a1f2b] bg-white px-6 py-3 text-sm font-semibold text-[#7a1f2b] shadow-[0_18px_48px_rgba(122,31,43,0.18)] transition duration-300 hover:bg-[#7a1f2b] hover:text-white"
            >
              <Phone size={16} />
              Call Support
            </a>
            <a
              href="https://wa.me/918545055656"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7a1f2b] bg-white px-6 py-3 text-sm font-semibold text-[#7a1f2b] shadow-[0_18px_48px_rgba(122,31,43,0.18)] transition duration-300 hover:bg-[#7a1f2b] hover:text-white"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
