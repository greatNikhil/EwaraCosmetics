"use client";

import { useEffect, useState } from "react";

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
    <section className="section-space-tight text-center">
      <div className="section-shell px-1">
        <span className="section-kicker">Trust at a glance</span>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] md:text-4xl">
          Built for everyday beauty rituals
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
          <div className="glass-card animate-fadeUp rounded-[28px] p-8">
            <p className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] md:text-5xl">
              2026
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Founded
            </p>
          </div>

          <div className="glass-card animate-fadeUp rounded-[28px] p-8 delay-100">
            <p className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] md:text-5xl">
              20+
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Products
            </p>
          </div>

          <div className="glass-card animate-fadeUp rounded-[28px] p-8 delay-300">
            <p className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] md:text-5xl">
              {count}+
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Orders Delivered
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
