"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import CheckoutModal from "./CheckoutModal";
import { ShoppingBag, Lock, Trash2, Plus, Minus } from "lucide-react";

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full sm:w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-[#ead2d8] bg-gradient-to-r from-[#fdf8f6] to-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#f7e7ea]">
              <ShoppingBag className="h-5 w-5 text-[#7a1f2b]" />
            </div>
            <h2 className="text-lg font-bold text-[#4a2c2a]">Your Bag</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200"
          >
            <svg className="h-6 w-6 text-[#4a2c2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {!loggedIn ? (
            // Login State
            <div className="h-full flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="p-4 rounded-full bg-[#f7e7ea] mb-4">
                <Lock className="h-8 w-8 text-[#7a1f2b]" />
              </div>
              <h3 className="text-lg font-semibold text-[#4a2c2a] mb-2">Sign In to Continue</h3>
              <p className="text-sm text-[#6b7280] mb-6">
                You need to be logged in to view and manage your bag
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Sign In Now
              </button>
            </div>
          ) : cart.length === 0 ? (
            // Empty Cart State
            <div className="h-full flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="p-4 rounded-full bg-[#f7e7ea] mb-4">
                <ShoppingBag className="h-8 w-8 text-[#7a1f2b]" />
              </div>
              <h3 className="text-lg font-semibold text-[#4a2c2a] mb-2">Your bag is empty</h3>
              <p className="text-sm text-[#6b7280] mb-6">
                Discover our beautiful collection and add items to your bag
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/shop");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            // Cart Items
            <div className="px-4 py-6 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex gap-4 p-4 rounded-xl border border-[#ead2d8] bg-[#fdf8f6] hover:border-[#7a1f2b]/20 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#ead2d8]">
                    <img
                      src={item.image || "/favicon/product.jpeg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#4a2c2a] line-clamp-2 mb-1">
                      {item.name}
                    </p>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-[#7a1f2b]">
                        ₹{item.price}
                      </span>
                      <span className="text-xs text-[#6b7280] font-medium">
                        Qty: {item.quantity}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-[#ead2d8] w-fit">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        className="p-1 hover:bg-[#f7e7ea] rounded transition-colors duration-200 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4 text-[#7a1f2b]" />
                      </button>

                      <span className="w-6 text-center text-sm font-semibold text-[#4a2c2a]">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => {
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        className="p-1 hover:bg-[#f7e7ea] rounded transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 text-[#7a1f2b]" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeItem(item.id);
                    }}
                    className="flex-shrink-0 p-2 text-[#b5a9a4] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Remove from bag"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Total & Buttons */}
        {loggedIn && cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-[#ead2d8] bg-white px-6 py-6 space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-2 pb-4 border-b border-[#ead2d8]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6b7280]">Subtotal</span>
                <span className="font-medium text-[#4a2c2a]">₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6b7280]">Shipping</span>
                <span className="text-xs font-semibold text-[#7a1f2b] bg-[#f7e7ea] px-2 py-1 rounded">
                  FREE
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#4a2c2a]">Total</span>
              <span className="text-2xl font-bold text-[#7a1f2b]">
                ₹{getTotalPrice()}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setShowCheckout(true);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#7a1f2b]/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span className="text-lg">→</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/cart");
                }}
                className="w-full py-3 px-4 border-2 border-[#7a1f2b] text-[#7a1f2b] font-bold rounded-lg hover:bg-[#f7e7ea] transition-all duration-200 active:scale-95"
              >
                View Full Cart
              </button>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <p className="text-xs text-[#6b7280]">Secure payments via:</p>
              <img src="/favicon/gpay.svg" alt="Google Pay" className="h-5 w-5" />
              <img src="/favicon/phonepe.svg" alt="PhonePe" className="h-5 w-5" />
              <img src="/favicon/paytm.svg" alt="Paytm" className="h-5 w-5" />
            </div>
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