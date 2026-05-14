"use client";

import { useState } from "react";
import { buildApiUrl } from "@/utils/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(buildApiUrl("/api/newsletter/subscribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      setMessage(
        data.message ||
          (response.ok ? "Subscribed successfully." : "Subscription failed.")
      );

      if (response.ok) {
        setEmail("");
      }
    } catch (error) {
      console.error("NEWSLETTER SUBSCRIBE ERROR:", error);
      setMessage("Subscription failed. Please try again.");
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <section className="section-space-tight">
      <div className="section-shell glass-card rounded-[32px] px-6 py-10 text-center md:px-10 md:py-14">
        <span className="section-kicker">Stay in the loop</span>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] md:text-4xl">
          Don&apos;t miss an update
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
          Get the latest product drops, exclusive offers, and beauty updates
          straight to your inbox.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 md:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-[var(--border-soft)] bg-white px-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary)]/10 md:w-[24rem]"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <button
            disabled={isSubmitting}
            className="rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[#c99b6b] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleSubscribe}
          >
            {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-[var(--brand-primary)]">{message}</p>}
      </div>
    </section>
  );
}
