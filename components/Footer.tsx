import Link from "next/link";
import {
  Clock3,
  CreditCard,
  Heart,
  Mail,
  Phone,
  Share2,
  ShieldCheck,
  Truck,
} from "lucide-react";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/help" },
  { label: "Track Order", href: "/orders" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms & Conditions", href: "/policies/terms&condtions" },
  { label: "Refund Policy", href: "#" },
];

const categories = [
  { label: "Skin", href: "/category/skincare" },
  { label: "Hair", href: "/category/hair" },
  { label: "Fragrance", href: "/category/fragrance" },
  { label: "New Arrivals", href: "/new-arrivals" },
];

const trustItems = [
  {
    title: "100% Authentic",
    subtitle: "Our Guarantee",
    icon: ShieldCheck,
  },
  {
    title: "Free Shipping",
    subtitle: "Above Rs. 699",
    icon: Truck,
  },
  {
    title: "Secure Payment",
    subtitle: "100% Protection",
    icon: CreditCard,
  },
];

const helpDeskItems = [
  {
    label: "Phone",
    value: "+91 8545055656",
    href: "tel:+918545055656",
    icon: Phone,
  },
  {
    label: "Email",
    value: "info@ewaraofficial.com",
    href: "mailto:info@ewaraofficial.com",
    icon: Mail,
  },
  {
    label: "Hours",
    value: "24 * 7",
    icon: Clock3,
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#25161e] text-white">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === trustItems.length - 1;

          return (
            <div
              key={item.title}
              className={`flex flex-col items-center border-b-[0.5px] border-white/[0.08] px-6 py-8 text-center ${
                !isLast ? "md:border-r-[0.5px] md:border-white/[0.08]" : ""
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.07]">
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="text-[#c49a6c]"
                />
              </div>
              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[#f5e8eb]">
                {item.title}
              </p>
              <p className="mt-1 text-[12px] text-white/[0.45]">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10 lg:px-10 lg:py-12 lg:pb-10">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[0.04em] text-[#f5e8eb]">
            EWAR<span className="text-[#c49a6c]">A</span>
          </h2>
          <p className="mt-5 max-w-[240px] text-[13px] leading-7 text-white/[0.5]">
            Premium beauty and skincare products for glowing skin.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border-[0.5px] border-white/[0.1] bg-white/[0.07] text-white/[0.6] transition hover:border-[#c49a6c] hover:bg-[rgba(196,154,108,0.2)]"
            >
              <Heart size={16} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border-[0.5px] border-white/[0.1] bg-white/[0.07] text-white/[0.6] transition hover:border-[#c49a6c] hover:bg-[rgba(196,154,108,0.2)]"
            >
              <Share2 size={16} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border-[0.5px] border-white/[0.1] bg-white/[0.07] text-white/[0.6] transition hover:border-[#c49a6c] hover:bg-[rgba(196,154,108,0.2)]"
            >
              <img
                src="/favicon/whatsapp.svg"
                alt="WhatsApp"
                className="h-4 w-4 opacity-70"
              />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-5 border-b-[0.5px] border-white/[0.08] pb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f5e8eb]">
            Quick Links
          </h3>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.label} className="mb-3">
                <Link
                  href={link.href}
                  className="group flex items-center gap-2 text-[13px] text-white/[0.52] transition hover:text-[#c49a6c]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#c49a6c] opacity-0 transition group-hover:opacity-100" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 border-b-[0.5px] border-white/[0.08] pb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f5e8eb]">
            Categories
          </h3>
          <ul>
            {categories.map((link) => (
              <li key={link.label} className="mb-3">
                <Link
                  href={link.href}
                  className="group flex items-center gap-2 text-[13px] text-white/[0.52] transition hover:text-[#c49a6c]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#c49a6c] opacity-0 transition group-hover:opacity-100" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 border-b-[0.5px] border-white/[0.08] pb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f5e8eb]">
            Help Desk
          </h3>

          <div>
            {helpDeskItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="mb-4 flex items-start gap-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(196,154,108,0.12)]">
                    <Icon
                      size={13}
                      strokeWidth={1.8}
                      className="text-[#c49a6c]"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/[0.3]">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-[13px] text-white/[0.65] transition hover:text-[#c49a6c]"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[13px] text-white/[0.65]">{item.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t-[0.5px] border-white/[0.08] px-6 py-5 text-center md:flex-row md:items-center md:justify-between md:text-left lg:px-10">
        <p className="text-[12px] text-white/[0.3]">
          Copyright 2026 Ewara. All rights reserved.
        </p>

        <p className="text-[12px] text-white/[0.2]">
          Developed by OAN DEVELOPERS
        </p>
      </div>
    </footer>
  );
}
