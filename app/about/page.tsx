import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-[#fdf8f6] text-[#4a1f2b]">
      <section
        className="relative isolate overflow-hidden bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/favicon/about.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#7a1f2b]/80 via-[#7a1f2b]/50 to-[#000000]/40" />
        <div className="relative mx-auto flex min-h-[40vh] md:min-h-[80vh] max-w-7xl items-center justify-center px-6 py-28 sm:px-8 lg:px-12">
          <div className="w-full max-w-3xl text-center animate-fadeUp space-y-6 rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-12">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-100">
              Beauty redefined
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              About Us
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              Crafting beauty with elegance and care — a premium destination for
              conscious skincare and couture cosmetics.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <section className="mb-16 rounded-[32px] bg-white/80 p-8 shadow-[0_20px_60px_rgba(122,31,43,0.08)] transition-all duration-500 sm:p-12 animate-fadeUp [animation-delay:0.1s]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/80">
              Our Story
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[#4a1a1f] sm:text-4xl">
              A beauty house shaped by trust and refinement
            </h2>
            <p className="mt-6 text-base leading-8 text-[#5e3339] sm:text-lg">
              We began with a clear vision: to bring Natural skincare and
              cosmetics into everyday rituals with products that feel beautiful
              and perform impeccably.
            </p>
            <p className="mt-4 text-base leading-8 text-[#5e3339] sm:text-lg">
              Our passion is rooted in natural ingredients, modern formulation,
              and thoughtful curation. Every texture, scent and finish is
              designed to elevate self-care with honesty.
            </p>
            <p className="mt-4 text-base leading-8 text-[#5e3339] sm:text-lg">
              With a customer-first focus, we offer premium experiences through
              transparent practices, gentle efficacy, and service that makes
              each moment feel indulgent.
            </p>
          </div>
        </section>

        <section className="mb-16 animate-fadeUp [animation-delay:0.2s] ">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/80">
              What We Offer
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[#4a1a1f] sm:text-4xl">
              Premium values, beautifully delivered
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Premium Quality Products",
                text: "Handpicked formulas, luxe finishes, and thoughtful packaging for every skincare ritual.",
                icon: "✨",
              },
              {
                title: "Natural Ingredients",
                text: "Botanical extracts and clean actives crafted to glow with skin-friendly luxury.",
                icon: "🌿",
              },
              {
                title: "Dermatologically Tested",
                text: "Gentle, safe and proven formulas created with expert care and clinical attention.",
                icon: "🧪",
              },
              {
                title: "Trusted by Customers",
                text: "A loyal community drawn to our quality, service, and the confidence our brand inspires.",
                icon: "🤍",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                style={{ animationDelay: `${i * 0.1}s` }}
                className="group rounded-[28px] border border-[#7a1f2b]/10 bg-white shadow-[0_20px_60px_rgba(122,31,43,0.08)] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(122,31,43,0.14)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f7e9e7] text-2xl text-[#7a1f2b] transition duration-300 group-hover:bg-[#7a1f2b] group-hover:text-white">
                  {item.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#4a1a1f]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6b484a]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[32px] bg-[#7a1f2b]/5 p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(122,31,43,0.08)] transition duration-300 hover:-translate-y-1">
              <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/90">
                Why Choose Us
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#4a1a1f]">
                Your confidence in every detail
              </h3>
              <div className="mt-8 space-y-5 text-[#5e3339]">
                {[
                  "Safe & Secure Products",
                  "Fast Delivery",
                  "Easy Returns",
                  "Customer Support",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7a1f2b] text-white">
                      ✓
                    </span>
                    <p className="text-base leading-7">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-[#7a1f2b]/10 bg-[#fff5f4] p-8 shadow-[0_20px_60px_rgba(122,31,43,0.08)] transition duration-300 hover:-translate-y-1">
              <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/90">
                Brand Highlights
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#4a1a1f]">
                Mission & Vision
              </h3>
              <div className="mt-8 space-y-8 text-[#5e3339]">
                <div>
                  <h4 className="text-xl font-semibold text-[#4a1a1f]">
                    Our Mission
                  </h4>
                  <p className="mt-3 leading-7">
                    To create a sensorial beauty collection that blends natural
                    elegance with modern performance, helping every customer
                    feel polished, cared for, and radiant.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#4a1a1f]">
                    Our Vision
                  </h4>
                  <p className="mt-3 leading-7">
                    To become the most trusted luxury beauty destination by
                    putting purity, craftsmanship, and personal service at the
                    heart of every experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-[#7a1f2b] text-white shadow-[0_25px_80px_rgba(122,31,43,0.25)]">
          <div className="flex flex-col items-center justify-between gap-8 px-8 py-14 text-center sm:px-12 lg:flex-row lg:text-left">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-pink-200">
                Discover elegance
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                Explore our full collection and bring home beauty that feels
                luxurious every day.
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#7a1f2b] transition duration-300 hover:bg-[#f4e3e1] hover:text-[#7a1f2b]"
            >
              Shop Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
