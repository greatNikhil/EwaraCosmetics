"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
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
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // ✅ NEW: Sync cart from backend when user logs in
    if (token) {
      syncFromBackend(token).catch((error) => {
        console.error("Failed to sync cart from backend:", error);
      });
    }
  }, [token, syncFromBackend]);

  const handleCheckout = () => {
    if (!token) {
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
        className={`fixed top-0 right-0 z-[999] flex h-full w-full flex-col overflow-hidden border-l border-[#e8d5d5] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out sm:w-[420px]
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#f0e0e0] bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#fdf6f6]">
              <ShoppingBag className="h-4 w-4 text-[#7a1a2e]" />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#7a1a2e] px-1 text-[9px] font-medium leading-none text-white">
                  {cart.length}
                </span>
              )}
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a1a1a]">
              Your bag
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#fdf6f6] text-[11px] text-[#7a1a2e] transition-colors duration-200 hover:bg-[#f7ecec]"
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

        <div className="no-scrollbar flex-1 overflow-hidden overflow-y-auto bg-white">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-full bg-[var(--blush-light)] p-4">
                <ShoppingBag className="h-8 w-8 text-[#7a1a2e]" />
              </div>
              <h3 className="mb-2 text-[14px] font-medium text-[#1a1a1a]">
                Your bag is empty
              </h3>
              <p className="mb-6 text-[11px] font-normal text-[#666]">
                Discover our beautiful collection and add items to your bag
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/shop");
                }}
                className="h-[46px] w-full rounded-[10px] bg-[#7a1a2e] px-4 py-[11px] text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#7a1a2e]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="px-[15px] py-[13px]"
                >
                  {(() => {
                    const displayName =
                      (item as any).product?.name ||
                      item.name ||
                      (item as any).productName ||
                      "Product";

                    return (
                  <div className="flex gap-3">
                    <div className="h-[58px] w-[58px] flex-shrink-0 overflow-hidden rounded-[10px] border border-[#eedede] bg-[#fdf6f6]">
                      <img
                        src={item.image || "/favicon/product.jpeg"}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 rounded-[10px] border border-[#eedede] bg-[#fdf6f6] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[14px] font-medium text-[#1a1a1a]">
                            {displayName}
                          </p>
                          <p className="mb-[7px] mt-1 text-[12px] font-normal text-[#888]">
                            Size / variant
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            await removeFromCart(item.id);
                          }}
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-transparent text-[11px] text-[#888] transition-colors duration-200 hover:text-[#7a1a2e]"
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
                            className="flex h-7 w-7 items-center justify-center rounded-[8px] border-[1.5px] border-[#d4a0a0] bg-white text-[14px] text-[#7a1a2e] transition-colors duration-200 hover:bg-[#fff7f8] disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="text-[12px] font-medium text-[#1a1a1a]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={async () => {
                              await updateCartQuantity(item.id, item.quantity + 1);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-[8px] border-[1.5px] border-[#d4a0a0] bg-white text-[14px] text-[#7a1a2e] transition-colors duration-200 hover:bg-[#fff7f8]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[13px] font-semibold text-[#7a1a2e]">
                          Rs. {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-[#f0e0e0] bg-white">
            <div className="space-y-2 px-[15px] py-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-normal text-[#666]">Subtotal</span>
                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                  Rs. {getTotalPrice()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-normal text-[#666]">Shipping</span>
                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                  Free
                </span>
              </div>
              <div className="h-px bg-[#f0e0e0]" />
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#1a1a1a]">Total</span>
                <span className="text-[15px] font-bold text-[#1a1a1a]">
                  Rs. {getTotalPrice()}
                </span>
              </div>
            </div>

            <div className="px-[15px] pb-[14px] pt-3">
              {token ? (
                <>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleCheckout();
                    }}
                    className="mb-[7px] flex h-[46px] w-full items-center justify-center rounded-[10px] bg-[#7a1a2e] px-4 py-[11px] text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-[#7a1a2e]"
                  >
                    <span>Proceed to checkout</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push("/cart");
                    }}
                    className="mb-[10px] block w-full bg-transparent text-center text-[11px] font-normal text-[#666] underline underline-offset-2 transition-colors duration-200 hover:text-[#666]"
                  >
                    View full cart
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/login");
                  }}
                  className="mb-[10px] flex h-[46px] w-full items-center justify-center rounded-[10px] border border-[#e0c8c8] bg-white px-4 py-[11px] text-[12px] font-semibold text-[#7a1a2e] transition-colors duration-200 hover:bg-[#fff7f7]"
                >
                  Sign in to checkout
                </button>
              )}

              <div className="flex flex-wrap items-center justify-center gap-[6px]">
                <span className="rounded-[6px] border border-[#e8d5d5] bg-[#fdf6f6] px-2 py-[4px] text-[9px] font-medium text-[#666]">
                  PhonePe
                </span>
                <span className="rounded-[6px] border border-[#e8d5d5] bg-[#fdf6f6] px-2 py-[4px] text-[9px] font-medium text-[#666]">
                  Bhim UPI
                </span>
                <span className="rounded-[6px] border border-[#e8d5d5] bg-[#fdf6f6] px-2 py-[4px] text-[9px] font-medium text-[#666]">
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
