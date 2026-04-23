"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating || !reviewText.trim()) {
      alert("Please select a rating and write your review.");
      return;
    }
    console.log({ rating, reviewText });
    alert("Thank you! Your review is ready to submit.");
    setRating(0);
    setHovered(0);
    setReviewText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[2rem] border border-[#e8d5c4] bg-white/95 p-8 shadow-[0_28px_64px_rgba(122,31,43,0.08)]"
    >
      <div>
        <h3 className="text-2xl font-semibold text-[#4a2c2a]">
          Give your opinion on the product
        </h3>
        <p className="mt-2 text-sm text-[#5a4f4d]">
          Share your experience and help us keep every detail beautifully
          crafted.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          return (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform duration-200"
            >
              <Star
                size={30}
                className={`transition-all duration-200 ${value <= (hovered || rating) ? "text-black scale-110" : "text-[#d9ccc7]"}`}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={reviewText}
        onChange={(event) => setReviewText(event.target.value)}
        placeholder="Tell us what you loved or what we can improve..."
        className="min-h-[140px] rounded-3xl border border-[#e8d5c4] bg-[#fbf6f3] px-5 py-4 text-sm text-[#4a2c2a] outline-none transition focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10"
      />

      <button
        type="submit"
        className="w-full rounded-full bg-[#7a1f2b] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_48px_rgba(122,31,43,0.18)] transition duration-300 hover:bg-[#5a1920]"
      >
        Submit Review
      </button>
    </form>
  );
}
