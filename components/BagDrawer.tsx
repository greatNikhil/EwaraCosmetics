"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import CheckoutModal from "./CheckoutModal";

export default function BagDrawer({ open, setOpen }: any) {
  const { items: cart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const { token } = useAuthStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Initialize loggedIn state on client-side to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
    setLoggedIn(!!token);
  }, [token]);

  const handleCheckout = () => {
    if (!token) {
      alert("Please login first");
      router.push("/login");
      return;
    }
    setShowCheckout(true);
  };

  // Avoid hydration mismatch by not rendering conditional content until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-[350px] flex-col border-l border-[#ead2d8] bg-[#fdf8f6] shadow-lg transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-shrink-0 justify-between border-b border-[#ead2d8] bg-[#fdf8f6] p-4">
          <h2 className="font-semibold text-[#4a2c2a]">YOUR BAG</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[#7a1f2b] hover:text-[#5c1721]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#fdf8f6] p-4">
          {!loggedIn ? (
            <p className="mt-10 text-center text-[#8a7f7b]">Login First 🔒</p>
          ) : cart.length === 0 ? (
            <p className="mt-10 text-center text-[#8a7f7b]">
              No items in cart 🛒
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="relative mb-4 flex gap-3 rounded-lg border border-[#ead2d8] bg-white p-3 shadow-sm"
              >
                <img
                  src="/favicon/bin.svg"
                  alt="delete"
                  className="absolute top-2 right-2 h-4 w-4 cursor-pointer opacity-60 transition hover:opacity-100"
                  onClick={() => {
                    removeItem(item.id);
                  }}
                />

                <img
                  src={item.image || "/favicon/product.jpeg"}
                  alt={item.name}
                  className="h-16 w-16 rounded object-cover"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-[#4a2c2a]">
                    {item.name}
                  </p>

                  <p className="text-sm font-semibold text-[#7a1f2b]">
                    ₹{item.price}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                      className="h-8 w-8 rounded-full bg-[#f7e7ea] text-[#7a1f2b] transition hover:bg-[#ead2d8]"
                    >
                      -
                    </button>

                    <span className="text-sm font-medium text-[#4a2c2a]">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      className="h-8 w-8 rounded-full bg-[#f7e7ea] text-[#7a1f2b] transition hover:bg-[#ead2d8]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {loggedIn && cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-[#ead2d8] bg-[#fdf8f6] p-4">
            <p className="mb-2 flex justify-between text-[#4a2c2a]">
              <span>Total</span>
              <span className="font-semibold text-[#7a1f2b]">
                ₹{getTotalPrice()}
              </span>
            </p>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/cart");
              }}
              className="mb-3 w-full rounded-full border border-[#7a1f2b] py-3 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
            >
              View Cart
            </button>

            <button
              onClick={() => {
                setOpen(false);
                setShowCheckout(true);
              }}
              className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] px-4 py-3 text-white transition-all duration-500 hover:bg-[length:200%_100%] hover:bg-right"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium tracking-wide">CHECKOUT →</span>

                <div className="relative flex items-center">
                  <img
                    src="/favicon/gpay.svg"
                    className="relative z-30 h-7 w-7"
                  />
                  <img
                    src="/favicon/phonepe.svg"
                    className="relative z-20 -ml-3 h-7 w-7"
                  />
                  <img
                    src="/favicon/paytm.svg"
                    className="relative z-10 -ml-3 h-7 w-7"
                  />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
}