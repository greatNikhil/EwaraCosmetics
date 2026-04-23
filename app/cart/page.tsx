"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  type CartItem,
} from "@/utils/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCartItems());
  }, []);

  const refresh = () => {
    setCart(getCartItems());
  };

  return (
    <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#4a2c2a]">Your Cart</h1>
          <p className="mt-2 text-[#6b7280]">
            Everything you’re about to overpay for.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-[#7a1f2b]">
              Your cart is empty.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#7a1f2b] px-6 py-3 font-semibold text-white hover:bg-[#8d2742]"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-3">
            {/* LEFT: ITEMS */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 rounded-3xl border border-[#ead2d8] bg-white p-4 shadow-sm"
                >
                  <img
                    src={item.image || "/favicon/product.jpeg"}
                    className="h-24 w-24 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-[#4a2c2a]">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-[#7a1f2b] font-bold">
                      ₹{item.price}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => {
                          updateCartQuantity(item._id, item.quantity - 1);
                          refresh();
                        }}
                        className="h-8 w-8 rounded-full bg-[#f7e7ea]"
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => {
                          updateCartQuantity(item._id, item.quantity + 1);
                          refresh();
                        }}
                        className="h-8 w-8 rounded-full bg-[#f7e7ea]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(item._id);
                        refresh();
                      }}
                      className="mt-3 text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm h-fit">
              <h2 className="text-xl font-semibold text-[#4a2c2a] mb-4">
                Order Summary
              </h2>

              <div className="flex justify-between mb-3 text-[#4a2c2a]">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>

              <div className="flex justify-between mb-3 text-[#4a2c2a]">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold text-[#7a1f2b]">
                <span>Total</span>
                <span>₹{getCartTotal()}</span>
              </div>

              <button
                className="mt-6 w-full rounded-full bg-[#7a1f2b] py-3 text-white font-semibold hover:bg-[#8d2742]"
                onClick={() => alert("Checkout coming next step...")}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}