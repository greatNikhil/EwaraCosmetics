import Link from "next/link";
export default function Footer() {
  return (
    <footer className="relative mt-16 text-white overflow-hidden">
      {/* 🔥 BACKGROUND GRADIENT + GLASS */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f2230] via-[#2a1f2b] to-[#1f2230] opacity-95"></div>

      {/* 🔥 GLASS LAYER */}
      <div className="relative backdrop-blur-xl bg-white/5 border-t border-white/10">
        {/* ✨ FLOATING LIGHT EFFECT */}
        <div className="absolute w-72 h-72 bg-[#7a1f2b]/30 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#d4a373]/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse"></div>

        {/* 🔥 FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-3 text-center py-10 border-b border-white/10">
          {/* 🔹 AUTHENTIC */}
          <div className="flex flex-col items-center gap-3 animate-fadeUp">
            <img
              src="/favicon/secure.svg"
              className="w-10 h-10 animate-float"
            />

            <p className="text-lg font-bold tracking-wide">100% Authentic</p>

            <p className="text-sm text-gray-300">Our Guarantee</p>
          </div>

          {/* 🔹 SHIPPING */}
          <div className="flex flex-col items-center gap-3 animate-fadeUp delay-150">
            <img
              src="/favicon/safe-delivery.svg"
              className="w-10 h-10 animate-float delay-150"
            />

            <p className="text-lg font-bold tracking-wide">Free Shipping</p>
            <p className="text-sm text-gray-300">Above ₹699</p>
          </div>

          {/* 🔹 PAYMENT */}
          <div className="flex flex-col items-center gap-3 animate-fadeUp delay-300">
            <img
              src="/favicon/credit-card.svg"
              className="w-10 h-10 animate-float drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />

            <p className="text-lg font-bold tracking-wide">Secure Payment</p>
            <p className="text-sm text-gray-300">100% Protection</p>
          </div>
        </div>

        {/* 🔥 MAIN */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 🧴 BRAND */}
          <div className="animate-fadeUp delay-100">
            <h2 className="text-xl font-bold mb-3 tracking-wide">Ewara</h2>
            <p className="text-sm text-gray-300 mb-4">
              Premium beauty & skincare products for glowing skin ✨
            </p>

            {/* SOCIAL ICONS (AUTO ANIMATION 😏) */}
            <div className="flex gap-4">
              <img src="/favicon/insta.svg" className="w-6 h-6 animate-float" />

              <img
                src="/favicon/facebook.svg"
                className="w-6 h-6 animate-float delay-150"
              />

              <img
                src="/favicon/whatsapp.svg"
                className="w-6 h-6 animate-float delay-300"
              />
            </div>
          </div>

          {/* 🔗 LINKS */}
          <div className="animate-fadeUp delay-200">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/help">Contact Us</Link>
              </li>
              <li>
                <Link href="/orders">Track Order</Link>
              </li>
              <li>
                <Link href="/policies/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/policies/terms&condtions">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* 🛍️ CATEGORIES */}
          <div className="animate-fadeUp delay-300">
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/category/skincare">Skin</Link>
              </li>
              <li>
                <Link href="/category/hair">Hair</Link>
              </li>
              <li>
                <Link href="/category/fragrance">Fragrance</Link>
              </li>
            </ul>
          </div>

          {/* 📞 HELP */}
          <div className="animate-fadeUp delay-400">
            <h3 className="font-semibold mb-3">Help Desk</h3>
            <p className="text-sm text-gray-300">📞 +91 9876543210</p>
            <p className="text-sm text-gray-300 mt-2">✉ support@ewara.com</p>
            <p className="text-sm text-gray-300 mt-2">Mon–Sat: 10AM–6PM</p>
          </div>
        </div>

        {/* 🔥 BOTTOM */}
        <div className="text-center text-sm text-gray-400 py-4 border-t border-white/10 animate-fadeUp">
          © 2026 Ewara. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
