"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Lock, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import CheckoutModal from "./CheckoutModal";
import { removeFromCart, updateCartQuantity } from "@/utils/cart";

export default function BagDrawer({ open, setOpen }: any) {
  const {
    items: cart,
    getTotalPrice,
    syncFromBackend,
  } = useCartStore();
  const { token } = useAuthStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setLoggedIn(!!token);

    // ✅ NEW: Sync cart from backend when user logs in
    if (token) {
      syncFromBackend(token).catch((error) => {
        console.error("Failed to sync cart from backend:", error);
      });
    }
  }, [token, syncFromBackend]);

  const handleCheckout = () => {
    if (!token) {
      alert("Please login first");
      router.push("/login");
      return;
    }
    setShowCheckout(true);
  };

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
        className={`fixed top-0 right-0 z-50 flex h-full w-full flex-col overflow-hidden rounded-l-[14px] border border-[var(--blush-border)] bg-[var(--blush-bg)] transition-transform duration-300 ease-out sm:w-[420px]
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--blush-border)] bg-[var(--blush-bg)] px-[15px] py-[13px]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--blush-light)]">
              <ShoppingBag className="h-4 w-4 text-[var(--blush-brand)]" />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--blush-brand)] px-1 text-[9px] font-medium leading-none text-white">
                  {cart.length}
                </span>
              )}
            </div>
            <h2 className="text-[14px] font-medium text-[var(--blush-dark)]">
              Your bag
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--blush-light)] text-[11px] text-[var(--blush-muted)] transition-colors duration-200 hover:bg-[var(--blush-light)]"
          >
            <svg
              className="h-[11px] w-[11px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-hidden overflow-y-auto bg-[var(--blush-bg)]">
          {!loggedIn ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-full bg-[var(--blush-light)] p-4">
                <Lock className="h-8 w-8 text-[var(--blush-brand)]" />
              </div>
              <h3 className="mb-2 text-[14px] font-medium text-[var(--blush-dark)]">
                Sign In to Continue
              </h3>
              <p className="mb-6 text-[11px] font-normal text-[var(--blush-muted)]">
                You need to be logged in to view and manage your bag
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
                className="w-full rounded-[10px] bg-[var(--blush-brand)] px-4 py-[11px] text-[12px] font-medium text-white transition-all duration-200 hover:bg-[var(--blush-brand)]"
              >
                Sign In Now
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-full bg-[var(--blush-light)] p-4">
                <ShoppingBag className="h-8 w-8 text-[var(--blush-brand)]" />
              </div>
              <h3 className="mb-2 text-[14px] font-medium text-[var(--blush-dark)]">
                Your bag is empty
              </h3>
              <p className="mb-6 text-[11px] font-normal text-[var(--blush-muted)]">
                Discover our beautiful collection and add items to your bag
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/shop");
                }}
                className="w-full rounded-[10px] bg-[var(--blush-brand)] px-4 py-[11px] text-[12px] font-medium text-white transition-all duration-200 hover:bg-[var(--blush-brand)]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group border-b border-[var(--blush-border)] px-[15px] py-[13px] last:border-b-0"
                >
                  <div className="flex gap-3">
                    <div className="h-[58px] w-[58px] flex-shrink-0 overflow-hidden rounded-[10px] border border-[var(--blush-border)] bg-[var(--blush-light)]">
                      <img
                        src={item.image || "/favicon/product.jpeg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[12px] font-medium text-[var(--blush-dark)]">
                            {item.name}
                          </p>
                          <p className="mb-[7px] mt-1 text-[10px] font-normal text-[var(--blush-muted)]">
                            Size / variant
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            await removeFromCart(item.id);
                          }}
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-transparent text-[11px] text-[var(--blush-muted)] transition-colors duration-200 hover:text-[var(--blush-brand)]"
                          title="Remove from bag"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              if (item.quantity > 1) {
                                await updateCartQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--blush-input-border)] bg-white text-[14px] text-[var(--blush-brand)] transition-colors duration-200 hover:bg-[var(--blush-selected-bg)] disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="text-[12px] font-medium text-[var(--blush-dark)]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={async () => {
                              await updateCartQuantity(item.id, item.quantity + 1);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--blush-input-border)] bg-white text-[14px] text-[var(--blush-brand)] transition-colors duration-200 hover:bg-[var(--blush-selected-bg)]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[13px] font-medium text-[var(--blush-brand)]">
                          Rs. {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loggedIn && cart.length > 0 && (
          <div className="flex-shrink-0 bg-[var(--blush-bg)]">
            <div className="space-y-2 px-[15px] py-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-normal text-[var(--blush-muted)]">Subtotal</span>
                <span className="text-[11px] font-normal text-[var(--blush-dark)]">
                  Rs. {getTotalPrice()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-normal text-[var(--blush-muted)]">Shipping</span>
                <span className="rounded-[4px] bg-[var(--green-bg)] px-[7px] py-[2px] text-[10px] font-medium text-[var(--green-text)]">
                  Free
                </span>
              </div>
              <div className="h-px bg-[var(--blush-border)]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--blush-dark)]">Total</span>
                <span className="text-[17px] font-medium text-[var(--blush-brand)]">
                  Rs. {getTotalPrice()}
                </span>
              </div>
            </div>

            <div className="px-[15px] pb-[14px] pt-3">
              <button
                onClick={() => {
                  setOpen(false);
                  handleCheckout();
                }}
                className="mb-[7px] flex w-full items-center justify-center rounded-[10px] bg-[var(--blush-brand)] px-4 py-[11px] text-[12px] font-medium text-white transition-colors duration-200 hover:bg-[var(--blush-brand)]"
              >
                <span>Proceed to checkout</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/cart");
                }}
                className="mb-[10px] block w-full bg-transparent text-center text-[11px] font-normal text-[var(--blush-muted)] underline underline-offset-2 transition-colors duration-200 hover:text-[var(--blush-muted)]"
              >
                View full cart
              </button>

              <div className="flex flex-wrap items-center justify-center gap-[6px]">
              <span className="rounded-[4px] border border-[var(--blush-border)] bg-[var(--blush-light)] px-2 py-[2px] text-[9px] font-medium text-[var(--blush-muted)]">
                PhonePe
              </span>
              <span className="rounded-[4px] border border-[var(--blush-border)] bg-[var(--blush-light)] px-2 py-[2px] text-[9px] font-medium text-[var(--blush-muted)]">
                Bhim UPI
              </span>
              <span className="rounded-[4px] border border-[var(--blush-border)] bg-[var(--blush-light)] px-2 py-[2px] text-[9px] font-medium text-[var(--blush-muted)]">
                Paytm
              </span>
              </div>
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
