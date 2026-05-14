"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    image: "/hero/hero1.jpg",
    title: "Glow Naturally",
    subtitle: "Discover premium skincare and beauty products for elevated daily rituals.",
  },
  {
    image: "/hero/hero2.jpg",
    title: "Radiant Skin Awaits",
    subtitle: "Explore nourishing formulas designed for every routine and every mood.",
  },
  {
    image: "/hero/hero3.jpg",
    title: "Clean Beauty Rituals",
    subtitle: "Pure, indulgent essentials for a fresh and luminous glow.",
  },
  {
    image: "/hero/hero4.jpg",
    title: "Self-Care Essentials",
    subtitle: "Skincare that feels luxurious, calming, and easy to return to every day.",
  },
  {
    image: "/hero/e1.jpeg",
    title: "Beauty from Within",
    subtitle: "Confidence starts with thoughtful routines and healthy-looking skin.",
  },
  {
    image: "/hero/hero5.png",
    title: "Glow On The Go",
    subtitle: "Travel-friendly picks that keep your routine polished wherever you are.",
  },
  {
    image: "/hero/hero6.png",
    title: "Smooth, Calm, Hydrated",
    subtitle: "Hydration-first formulas for balanced beauty and everyday comfort.",
  },
  {
    image: "/hero/hero8.png",
    title: "Always Fresh",
    subtitle: "Refresh your shelf with uplifting essentials made for modern routines.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prevIndex) => {
        setPrev(prevIndex);
        return (prevIndex + 1) % slides.length;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setPrev(current);
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setPrev(current);
    setCurrent((current + 1) % slides.length);
  };

  return (
    <section className="relative h-[42svh] overflow-hidden md:h-[78vh]">
      {slides.map((slide, index) => (
        <div
          key={`slide-${index}`}
          className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(.4,0,.2,1)] ${
            index === current
              ? "z-0 translate-x-0 opacity-100"
              : index === prev
                ? "z-0 -translate-x-full opacity-0"
                : "z-0 translate-x-full opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover animate-zoom"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-20 bg-[linear-gradient(90deg,rgba(26,13,10,0.78)_0%,rgba(26,13,10,0.28)_46%,rgba(26,13,10,0.14)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[21] w-full bg-gradient-to-r from-[#170d0b]/85 via-[#170d0b]/20 to-transparent md:w-1/2" />

      {slides.map((slide, index) => {
        const isCurrent = index === current;
        const isPrev = index === prev;
        const wrapperState = isCurrent
          ? "opacity-100 translate-x-0"
          : isPrev
            ? "opacity-0 -translate-x-full"
            : "opacity-0 translate-x-full";

        return (
          <div
            key={`content-${index}`}
            className={`absolute inset-y-0 left-0 z-30 flex w-full max-w-2xl flex-col justify-center px-5 text-left sm:px-7 md:px-12 lg:px-20 ${wrapperState} transition-opacity transition-transform duration-1000 ease-[cubic-bezier(.4,0,.2,1)]`}
          >
            <span
              className={`mb-5 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition-all duration-1000 ${
                isCurrent ? "translate-x-0 opacity-100 delay-75" : "-translate-x-full opacity-0"
              }`}
            >
              Premium beauty rituals
            </span>

            <h1
              className={`mb-5 max-w-[12ch] text-4xl font-semibold leading-[0.92] tracking-[-0.05em] text-white drop-shadow-[0_20px_30px_rgba(0,0,0,0.42)] transition-all duration-1000 md:text-6xl ${
                isCurrent ? "translate-x-0 opacity-100 delay-100" : "-translate-x-full opacity-0"
              }`}
            >
              {slide.title}
            </h1>

            <p
              className={`mb-8 max-w-[34rem] text-sm leading-7 text-white/84 drop-shadow-[0_16px_24px_rgba(0,0,0,0.35)] transition-all duration-1000 md:text-lg ${
                isCurrent ? "translate-x-0 opacity-100 delay-200" : "-translate-x-full opacity-0"
              }`}
            >
              {slide.subtitle}
            </p>

            <button
              onClick={() => router.push("/shop")}
              className={`w-fit rounded-full bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)] shadow-soft transition-all duration-1000 hover:scale-[1.03] ${
                isCurrent ? "translate-x-0 opacity-100 delay-300" : "-translate-x-full opacity-0"
              }`}
            >
              Shop Now
            </button>
          </div>
        );
      })}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/20 bg-white/12 p-3 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/20 active:scale-90"
        aria-label="Previous slide"
      >
        &#10094;
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/20 bg-white/12 p-3 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/20"
        aria-label="Next slide"
      >
        &#10095;
      </button>
    </section>
  );
}
