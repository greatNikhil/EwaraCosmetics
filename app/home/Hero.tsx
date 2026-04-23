"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    image: "/hero/hero1.jpg",
    title: "Glow Naturally ✨",
    subtitle: "Discover premium skincare & beauty products",
  },
  {
    image: "/hero/hero2.jpg",
    title: "Radiant Skin Awaits",
    subtitle: "Explore nourishing products for every routine",
  },
  {
    image: "/hero/hero3.jpg",
    title: "Clean Beauty Rituals",
    subtitle: "Pure ingredients for a luminous glow",
  },
  {
    image: "/hero/hero4.jpg",
    title: "Self-Care Essentials",
    subtitle: "Skincare that feels luxurious every day",
  },
  {
    image: "/hero/e1.jpeg",
    title: "Beauty from Within",
    subtitle: "Confidence starts with a healthy skincare routine",
  },
  {
    image: "/hero/hero5.png",
    title: "Glow On The Go",
    subtitle: "Travel-friendly picks for your best skin",
  },
  {
    image: "/hero/hero6.png",
    title: "Smooth, Calm, Hydrated",
    subtitle: "Hydration-first formulas for balanced beauty",
  },
  {
    image: "/hero/hero8.png",
    title: "Always Fresh",
    subtitle: "Refresh your skincare with uplifting essentials",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(0);
  const router = useRouter();

  // 🔄 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prevIndex) => {
        setPrev(prevIndex);
        return (prevIndex + 1) % slides.length;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ⬅ PREV
  const prevSlide = () => {
    setPrev(current);
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  // ➡ NEXT
  const nextSlide = () => {
    setPrev(current);
    setCurrent((current + 1) % slides.length);
  };

  return (
    <section className="relative h-[30svh] md:h-[80vh] overflow-hidden">
      {/* 🔥 IMAGES */}
      {slides.map((slide, index) => (
        <div
          key={`slide-${index}`}
          className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(.4,0,.2,1)]
            ${index === current ? "opacity-100 translate-x-0 z-0" : index === prev ? "opacity-0 -translate-x-full z-0" : "opacity-0 translate-x-full z-0"}`}
        >
          <img
            src={slide.image}
            className="w-full h-full object-cover animate-zoom"
          />
        </div>
      ))}

      {/* 🔥 OVERLAY */}
      <div className="absolute inset-0 bg-black/20 z-20" />

      {/* 🔥 LEFT GRADIENT */}
      <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-black/95 via-black/30 to-transparent opacity-90 z-[21] pointer-events-none" />

      {/* 🔥 CONTENT */}
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
            className={`absolute inset-y-0 left-0 z-30 flex w-full max-w-xl flex-col justify-center text-left px-4 sm:px-6 md:px-10 lg:px-14 transition-opacity transition-transform duration-1000 ease-[cubic-bezier(.4,0,.2,1)] ${wrapperState}`}
          >
            <h1
              className={`text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_20px_30px_rgba(0,0,0,0.55)] transition-all duration-1000 ${isCurrent ? "opacity-100 translate-x-0 delay-100" : "opacity-0 -translate-x-full"}`}
            >
              {slide.title}
            </h1>

            <p
              className={`text-sm md:text-base mb-6 text-white/90 drop-shadow-[0_16px_24px_rgba(0,0,0,0.4)] transition-all duration-1000 ${isCurrent ? "opacity-100 translate-x-0 delay-200" : "opacity-0 -translate-x-full"}`}
            >
              {slide.subtitle}
            </p>

            {/* 🔥 SHOP BUTTON */}
            <button
              onClick={() => router.push("/shop")}
              className={`px-6 py-3 rounded-full bg-white text-[#7a1f2b] hover:scale-105 transition-all duration-1000 ${isCurrent ? "opacity-100 translate-x-0 delay-300" : "opacity-0 -translate-x-full"}`}
            >
              Shop Now
            </button>
          </div>
        );
      })}

      {/* ⬅ LEFT ARROW */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 
                   bg-white/30 backdrop-blur-md p-3 rounded-full 
                   hover:bg-white/50 transition hover:scale-110 active:scale-90"
      >
        ❮
      </button>

      {/* ➡ RIGHT ARROW */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 
                   bg-white/30 backdrop-blur-md p-3 rounded-full 
                   hover:bg-white/50 transition"
      >
        ❯
      </button>
    </section>
  );
}
