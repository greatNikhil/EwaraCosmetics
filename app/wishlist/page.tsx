"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getWishlistItems,
  removeFromWishlist,
  type WishlistItem,
} from "@/utils/wishlist";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setWishlist(getWishlistItems());
  }, []);

  const handleRemove = (_id: string) => {
    removeFromWishlist(_id);
    setWishlist(getWishlistItems());
  };

  return (
    <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#4a2c2a]">Wishlist</h1>
          <p className="mt-2 text-[#6b7280]">
            Your saved favorites, because apparently indecision needed a UI.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-[#7a1f2b]">
              Your wishlist is empty.
            </p>
            <p className="mt-3 text-[#6b7280]">
              Browse products and save the ones you like.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#7a1f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#8d2742]"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="rounded-3xl border border-[#ead2d8] bg-white p-4 shadow-sm transition hover:shadow-lg"
              >
                <div className="overflow-hidden rounded-2xl bg-[#f7e9e7]">
                  <img
                    src={item.image || "/favicon/product.jpeg"}
                    alt={item.name}
                    className="h-64 w-full object-cover"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#7a1f2b]/70">
                    {item.category}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-[#4a2c2a]">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-sm text-[#6b7280]">
                    {item.brand || "Ewara Cosmetics"}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-lg font-bold text-[#7a1f2b]">
                      ₹{item.price}
                    </p>

                    {item.originalPrice &&
                      item.originalPrice > item.price && (
                        <p className="text-sm text-gray-400 line-through">
                          ₹{item.originalPrice}
                        </p>
                      )}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href="/shop"
                      className="flex-1 rounded-full border border-[#7a1f2b] px-4 py-2 text-center font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
                    >
                      Shop More
                    </Link>

                    <button
                      onClick={() => handleRemove(item._id)}
                      className="flex-1 rounded-full bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}