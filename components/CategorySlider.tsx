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
  "₹250 OFF on orders above ₹1499",
  "Flat 15% OFF on skincare",
  "Buy 2 Get 1 on haircare",
  "Free shipping above ₹699",
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
  const [offerIndex, setOfferIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

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
      "[data-slide-card]",
    ) as HTMLElement | null;
    const gap = 24;
    const amount = card ? card.offsetWidth + gap : 280;

    trackRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-8 md:py-10 bg-[#fdf8f6]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="relative">
          {showArrows && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByAmount("left")}
              className="hidden md:flex absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-3
                       h-11 w-11 items-center justify-center rounded-full
                       bg-transparent backdrop-blur-md border border-[#ead2d8]
                       shadow-md hover:scale-105 transition"
            >
              <ChevronLeft className="h-5 w-5 text-[#5a4f4d]" />
            </button>
          )}
          <div
            ref={trackRef}
            className="flex gap-3 md:gap-6 overflow-x-auto scroll-smooth no-scrollbar px-1"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                data-slide-card
                className="group shrink-0 w-[160px] sm:w-[200px] md:w-[270px]"
              >
                {/* CARD WRAPPER */}
                <div className="flex flex-col items-center text-center group">
                  {/* IMAGE AREA */}
                  <div className="relative mb-3 flex items-center justify-center">
                    {/* 🔥 PURPLE GLOW */}
                    <div
                      className="absolute w-[90px] h-[90px] md:w-[130px] md:h-[130px] 
                    bg-gradient-to-br from-[#e0d4ff] to-[#bfa8ff] 
                    rounded-full blur-2xl opacity-70"
                    />

                    {/* 🔥 CONTENT */}
                    {item.kind === "offer" ? (
                      <div className="relative z-10 flex flex-col items-center justify-center px-4">
                        <div className="mb-2 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[#7a1f2b]">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-semibold tracking-wide">
                            Special Offer
                          </span>
                        </div>

                        <p
                          key={offerIndex}
                          className="text-xl md:text-4xl font-extrabold leading-none text-[#2f2430]
                     animate-[fadeIn_.45s_ease]"
                        >
                          {offerText.split(" ")[0]}
                        </p>

                        <p
                          key={`${offerIndex}-sub`}
                          className="mt-2 max-w-[180px] text-sm font-medium text-[#5a4f4d]
                     animate-[fadeIn_.45s_ease]"
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
                        className="relative z-10 h-[90px] md:h-[130px] w-auto object-contain 
                   transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="relative z-10 flex h-[90px] w-[90px] md:h-[130px] md:w-[130px] 
                      items-center justify-center rounded-full bg-[#e8ddff]"
                      >
                        <span className="text-sm font-semibold text-[#7a1f2b]">
                          {item.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 🔥 TEXT */}
                  <h3
                    className="text-sm md:text-[22px] font-semibold text-[#2f2430]
               transition duration-300 group-hover:text-[#7a1f2b]"
                  >
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
              className="hidden md:flex absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-3
                       h-11 w-11 items-center justify-center rounded-full
                       bg-white/85 backdrop-blur-md border border-[#ead2d8]
                       shadow-md hover:scale-105 transition"
            >
              <ChevronRight className="h-5 w-5 text-[#5a4f4d]" />
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead2d8] bg-white text-[#5a4f4d] shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead2d8] bg-white text-[#5a4f4d] shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
