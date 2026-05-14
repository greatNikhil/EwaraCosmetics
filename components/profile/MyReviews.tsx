"use client";

import Link from "next/link";
import { Star } from "lucide-react";

type MyReviewsProps = {
  reviewCards: any[];
  formatDate: (value?: string) => string;
};

export default function MyReviews({
  reviewCards,
  formatDate,
}: MyReviewsProps) {
  if (reviewCards.length === 0) {
    return (
      <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-6 text-sm text-[#7f6b73]">
        <p className="text-sm text-[#2f1f25]">
          Review history is not synced to the profile yet.
        </p>
        <p className="mt-2 leading-6">
          You can still leave reviews from eligible product pages after
          purchase.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/profile?tab=orders"
            className="rounded-[8px] border border-[#7B2D42] px-3 py-2 text-xs font-medium text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
          >
            View Orders
          </Link>
          <Link
            href="/shop"
            className="rounded-[8px] bg-[#7B2D42] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviewCards.map((review) => (
        <div
          key={review.id}
          className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-[14px]"
        >
          <p className="text-sm font-medium text-[#2f1f25]">{review.name}</p>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={15}
                className="text-[#7B2D42]"
                fill={index < review.rating ? "#7B2D42" : "none"}
                strokeWidth={1.8}
              />
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-[#6f5b63]">{review.text}</p>
          <p className="mt-3 text-xs text-[#9a8a91]">{formatDate(review.date)}</p>
        </div>
      ))}
    </div>
  );
}
