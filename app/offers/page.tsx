import Link from "next/link";
import OfferCard from "@/components/offer/OfferCard";

const offers = [
  {
    id: 1,
    title: "Summer Radiance Set",
    description:
      "Save up to 40% on premium skincare rituals crafted for glowing skin.",
    image: "/slider/skin.jpg",
  },
  {
    id: 2,
    title: "Velvet Glow Fragrance",
    description:
      "Discover limited-edition scents and enjoy lavish savings on every bottle.",
    image: "/slider/l5.jpeg",
  },
  {
    id: 3,
    title: "Hair Luxe Essentials",
    description:
      "Refresh your haircare routine with nourishing salon-quality treatments.",
    image: "/slider/d1.jpeg",
  },
  {
    id: 4,
    title: "Premium Gift Edit",
    description:
      "Curated luxury bundles for a beautifully elevated self-care ritual.",
    image: "/hero/e1.jpeg",
  },
];

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-[#fdf8f6] text-[#4a2c2a]">
      <section className="relative overflow-hidden bg-[#f3ece8]">
        <video
          className="h-[70vh] w-full object-cover opacity-40 scale-105"
          autoPlay
          muted
          loop
          playsInline
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b 
            from-[#7a1f2b]/30 via-transparent to-[#fdf8f6]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center ... animate-fadeUp delay-200">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-white/80">
            Exclusive Offers
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Indulge in Luxury Offers Curated for Your Glow
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            Soft, premium savings designed for a refined beauty routine with
            effortless elegance.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:pt-16">
        <div className="-mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              title={offer.title}
              description={offer.description}
              image={offer.image}
            />
          ))}
        </div>
      </section>

      <section className="flex justify-center pb-24 px-4">
        <Link
          href="/shop"
          className="relative overflow-hidden inline-flex items-center justify-center 
             rounded-full px-10 py-4 text-base font-semibold 
             text-[#7a1f2b] border border-[#7a1f2b] 
             group"
        >
          <span className="relative z-10 transition duration-300 group-hover:text-white">
            Shop Now →
          </span>

          <span
            className="absolute inset-0 bg-[#7a1f2b] 
                   translate-y-full group-hover:translate-y-0 
                   transition-transform duration-300"
          ></span>
        </Link>
      </section>
    </main>
  );
}
