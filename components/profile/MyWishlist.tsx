"use client";

import Link from "next/link";
import { Heart, Package } from "lucide-react";
import type { WishlistItem } from "@/utils/wishlist";

type MyWishlistProps = {
  wishlistItems: WishlistItem[];
  handleWishlistRemove: (_id: string) => Promise<void> | void;
  handleWishlistMoveToCart: (item: WishlistItem) => Promise<void> | void;
};

export default function MyWishlist({
  wishlistItems,
  handleWishlistRemove,
  handleWishlistMoveToCart,
}: MyWishlistProps) {
  if (wishlistItems.length === 0) {
    return (
      <div className="rounded-[12px] border border-[#f0dde2] bg-[#fdf6f7] p-6 text-sm text-[#7f6b73]">
        <p>No wishlist items yet.</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex rounded-[8px] border border-[#7B2D42] px-3 py-2 text-xs font-medium text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {wishlistItems.map((item) => (
        <div
          key={item._id}
          className="rounded-[12px] border border-[#f0dde2] bg-white p-3"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-24 flex-1 items-center justify-center rounded-[10px] bg-[#fdf6f7]">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name || item.productName || "Wishlist product"}
                  className="h-full w-full rounded-[10px] object-cover"
                />
              ) : (
                <Package size={28} className="text-[#c0a8b0]" />
              )}
            </div>
            <button
              type="button"
              onClick={() => handleWishlistRemove(item._id)}
              className="shrink-0 rounded-full border border-[#f0dde2] p-2 text-[#7B2D42]"
            >
              <Heart size={14} fill="currentColor" />
            </button>
          </div>
          <p className="text-sm font-medium text-[#2f1f25]">
            {item.name || item.productName || "Product"}
          </p>
          <p className="mt-1 text-sm text-[#7B2D42]">
            Rs. {Number(item.price || 0).toFixed(2)}
          </p>
          <button
            type="button"
            onClick={() => handleWishlistMoveToCart(item)}
            className="mt-3 rounded-[8px] border border-[#7B2D42] px-3 py-1.5 text-xs font-medium text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
          >
            Move to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
