"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/offer/OfferCard";
import { buildApiUrl } from "@/utils/api";

interface ActiveOffer {
  _id: string;
  text: string;
  isActive: boolean;
  displayOrder: number;
}

const fallbackImages = [
  "/slider/skin.jpg",
  "/slider/l5.jpeg",
  "/slider/d1.jpeg",
  "/hero/e1.jpeg",
];

const fallbackOffers: ActiveOffer[] = [
  {
    _id: "fallback-1",
    text: "First Order: Get Extra 10% Off on Rs. 700+",
    isActive: true,
    displayOrder: 0,
  },
  {
    _id: "fallback-2",
    text: "Up to 50% Off + Surprise Gifts",
    isActive: true,
    displayOrder: 1,
  },
  {
    _id: "fallback-3",
    text: "Free Shipping on Orders Above Rs. 999",
    isActive: true,
    displayOrder: 2,
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<ActiveOffer[]>(fallbackOffers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOffers = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/offers"), {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.offers)) {
          return;
        }

        if (isMounted) {
          setOffers(data.offers);
        }
      } catch (error) {
        console.error("Failed to load offers page data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const offerCards = useMemo(
    () =>
      offers.map((offer, index) => ({
        id: offer._id,
        title: `Offer ${index + 1}`,
        description: offer.text,
        image: fallbackImages[index % fallbackImages.length],
      })),
    [offers]
  );

  return (
    <main className="min-h-screen bg-[#fdf8f6] text-[#4a2c2a]">
      <section className="relative overflow-hidden bg-[#f3ece8]">
        <video
          className="h-[70vh] w-full scale-105 object-cover opacity-40"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
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
          {offerCards.map((offer) => (
            <OfferCard
              key={offer.id}
              title={offer.title}
              description={offer.description}
              image={offer.image}
            />
          ))}
        </div>

        {!loading && offerCards.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#7d6d62]">
            No active offers available right now.
          </p>
        ) : null}
      </section>

      <section className="flex justify-center px-4 pb-24">
        <Link
          href="/shop"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#7a1f2b] px-10 py-4 text-base font-semibold text-[#7a1f2b]"
        >
          <span className="relative z-10 transition duration-300 group-hover:text-white">
            Shop Now →
          </span>

          <span className="absolute inset-0 translate-y-full bg-[#7a1f2b] transition-transform duration-300 group-hover:translate-y-0" />
        </Link>
      </section>
    </main>
  );
}
