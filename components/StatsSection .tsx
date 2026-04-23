"use client";
import { useState, useEffect } from "react";

export function StatsSection() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= 100) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, []);
  return (
    <section className="bg-[#f8f5f2] py-12 text-center">
      <h2 className="text-lg md:text-xl font-semibold text-[#3e2f2b] mb-8 tracking-wide">
        TRUSTED BY OUR FAM!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16  max-w-4xl mx-auto px-6">
        <div className="animate-fadeUp">
          <p className="text-3xl md:text-4xl font-bold text-[#3e2f2b]">2026</p>
          <p className="text-sm text-[#7a6f6b] mt-2">Founded</p>
        </div>

        <div className="animate-fadeUp delay-100">
          <p className="text-3xl md:text-4xl font-bold text-[#3e2f2b]">20+</p>
          <p className="text-sm text-[#7a6f6b] mt-2">Products</p>
        </div>

        <div className="animate-fadeUp delay-300">
          <p className="text-3xl md:text-4xl font-bold text-[#3e2f2b]">
            {count}+
          </p>
          <p className="text-sm text-[#7a6f6b] mt-2">Orders Delivered</p>
        </div>
      </div>
    </section>
  );
}
