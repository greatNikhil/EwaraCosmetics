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
    <section className="bg-[#fdf8f6] py-10 text-center md:py-12">
      <h2 className="text-xl font-semibold text-[#3e2f2b] md:text-2xl">
        Don&apos;t miss an update!
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm text-[#7a6f6b] md:text-base">
        Get latest product drops, offers and updates straight to your inbox
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-xl border border-[#ead2d8] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/30 md:w-80"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <button
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-[#7a1f2b] to-[#d4a373] px-6 py-3 font-medium text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleSubscribe}
        >
          {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-[#7a1f2b]">{message}</p>}
    </section>
  );
}
