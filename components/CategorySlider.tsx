"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

type SlideItem = {
  id: number;
  title: string;
  href: string;
  image?: string;
  kind?: "offer" | "category";
};

const offerTexts = [
  "Rs. 250 OFF on orders above Rs. 1499",
  "Flat 15% OFF on skincare",
  "Buy 2 Get 1 on haircare",
  "Free shipping above Rs. 699",
];

const items: SlideItem[] = [
  {
    id: 1,
    title: "Offer",
    href: "/offers",
    kind: "offer",
  },
  {
    id: 2,
    title: "Skin",
    href: "/category/skincare",
    image: "/slider/skin.jpg",
    kind: "category",
  },
  {
    id: 3,
    title: "Hair",
    href: "/category/hair",
    image: "/slider/d1.jpeg",
    kind: "category",
  },
  {
    id: 4,
    title: "Fragrance",
    href: "/category/fragrance",
    image: "/slider/l5.jpeg",
    kind: "category",
  },
];

export default function CategorySlider() {
  const [showArrows, setShowArrows] = useState(false);
  const [offerIndex, setOfferIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!trackRef.current) return;

      const { scrollWidth, clientWidth } = trackRef.current;
      setShowArrows(scrollWidth > clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % offerTexts.length);
    }, 2000);

    return () => clearInterval(id);
  }, []);

  const offerText = useMemo(() => offerTexts[offerIndex], [offerIndex]);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!trackRef.current) return;

    const card = trackRef.current.querySelector(
      "[data-slide-card]"
    ) as HTMLElement | null;
    const gap = 24;
    const amount = card ? card.offsetWidth + gap : 280;

    trackRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="section-space-tight w-full">
      <div className="section-shell px-1">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="section-kicker">Browse by intent</span>
            <h2 className="section-heading">Shop by category</h2>
          </div>
        </div>

        <div className="relative">
          {showArrows && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByAmount("left")}
              className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white/80 shadow-md backdrop-blur-md transition hover:scale-105 md:flex"
            >
              <ChevronLeft className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          )}

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth px-1 md:gap-6"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                data-slide-card
                className="group w-[170px] shrink-0 sm:w-[220px] md:w-[280px]"
              >
                <div className="glass-card flex flex-col items-center rounded-[30px] px-5 py-8 text-center transition duration-300 group-hover:-translate-y-1 group-hover:shadow-soft">
                  <div className="relative mb-5 flex items-center justify-center">
                    <div className="absolute h-[110px] w-[110px] rounded-full bg-gradient-to-br from-[#f2ded0] to-[#ead0c1] blur-2xl opacity-90 md:h-[150px] md:w-[150px]" />

                    {item.kind === "offer" ? (
                      <div className="relative z-10 flex flex-col items-center justify-center px-4">
                        <div className="mb-3 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[var(--brand-primary)]">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-semibold tracking-wide">
                            Special Offer
                          </span>
                        </div>

                        <p
                          key={offerIndex}
                          className="animate-[fadeIn_.45s_ease] text-2xl font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)] md:text-4xl"
                        >
                          {offerText.split(" ")[0]}
                        </p>

                        <p
                          key={`${offerIndex}-sub`}
                          className="mt-3 max-w-[180px] animate-[fadeIn_.45s_ease] text-sm leading-6 text-[var(--text-secondary)]"
                        >
                          {offerText
                            .replace(offerText.split(" ")[0], "")
                            .trim()}
                        </p>
                      </div>
                    ) : item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="relative z-10 h-[100px] w-auto object-contain transition duration-300 group-hover:scale-105 md:h-[140px]"
                      />
                    ) : (
                      <div className="relative z-10 flex h-[90px] w-[90px] items-center justify-center rounded-full bg-[#e8ddff] md:h-[130px] md:w-[130px]">
                        <span className="text-sm font-semibold text-[var(--brand-primary)]">
                          {item.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold tracking-[-0.03em] text-[var(--text-primary)] transition duration-300 group-hover:text-[var(--brand-primary)] md:text-[22px]">
                    {item.kind === "offer" ? "Offers" : item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {showArrows && (
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByAmount("right")}
              className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-3 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white/85 shadow-md backdrop-blur-md transition hover:scale-105 md:flex"
            >
              <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--text-secondary)] shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--text-secondary)] shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
