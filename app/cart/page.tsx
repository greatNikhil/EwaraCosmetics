"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  removeUnavailableCartItems,
  type CartItem,
} from "@/utils/cart";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import CheckoutModal from "@/components/CheckoutModal";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const { token } = useAuthStore();
  const syncFromBackend = useCartStore((state) => state.syncFromBackend);

  useEffect(() => {
    const syncCart = async () => {
      if (token) {
        await syncFromBackend(token);
      }

      await removeUnavailableCartItems();

      setCart(getCartItems());
    };

    syncCart();

    const handleRefresh = () => {
      syncCart();
    };

    window.addEventListener("userChanged", handleRefresh);
    window.addEventListener("storage", handleRefresh);

    return () => {
      window.removeEventListener("userChanged", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
    };
  }, [syncFromBackend, token]);

  const refresh = () => {
    setCart(getCartItems());
  };

  const handleCheckout = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    const removedCount = await removeUnavailableCartItems();
    const refreshedCart = getCartItems();
    setCart(refreshedCart);

    if (removedCount > 0) {
      alert("Some unavailable products were removed from your cart. Please review your cart and continue.");
    }

    if (refreshedCart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setShowCheckout(true);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#fdf8f6] to-[#f7e7ea] px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-[#7a1f2b]" />
              <h1 className="text-4xl font-bold text-[#4a2c2a] md:text-5xl">
                Shopping Cart
              </h1>
            </div>
            <p className="text-lg text-[#6b7280]">
              {cart.length === 0
                ? "Your cart is empty"
                : `You have ${totalItems} item${totalItems > 1 ? "s" : ""}`}
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border-2 border-[#ead2d8] bg-white p-12 text-center shadow-lg">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#f7e7ea]">
                <ShoppingBag className="h-10 w-10 text-[#7a1f2b]" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-[#4a2c2a]">
                Cart is Empty
              </h2>
              <p className="mb-8 text-[#6b7280]">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] px-8 py-4 font-bold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3 md:col-span-2">
                <div className="mb-4 rounded-2xl border border-[#ead2d8] bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-lg font-bold text-[#4a2c2a]">
                    Order Items
                  </h2>
                  <p className="text-sm text-[#6b7280]">
                    {cart.length} item{cart.length > 1 ? "s" : ""} in cart
                  </p>
                </div>

                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 rounded-2xl border border-[#ead2d8] bg-white p-4 transition-shadow duration-200 hover:shadow-md"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || "/favicon/product.jpeg"}
                        alt={item.name}
                        className="h-28 w-28 rounded-xl object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold text-[#4a2c2a]">
                        {item.name}
                      </h3>

                      <p className="mb-4 text-xl font-bold text-[#7a1f2b]">
                        Rs. {item.price}
                      </p>

                      <div className="mb-4 flex w-fit items-center gap-1 rounded-lg bg-[#f7e7ea] p-1">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateCartQuantity(item._id, item.quantity - 1);
                              refresh();
                            }
                          }}
                          className="rounded-lg p-2 transition-colors hover:bg-[#ead2d8]"
                        >
                          <Minus size={18} className="text-[#7a1f2b]" />
                        </button>

                        <span className="w-10 text-center font-semibold text-[#4a2c2a]">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => {
                            updateCartQuantity(item._id, item.quantity + 1);
                            refresh();
                          }}
                          className="rounded-lg p-2 transition-colors hover:bg-[#ead2d8]"
                        >
                          <Plus size={18} className="text-[#7a1f2b]" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item._id);
                          refresh();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-1 font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="flex items-start justify-end text-lg font-bold text-[#4a2c2a]">
                      Rs. {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:col-span-1">
                <div className="sticky top-4 rounded-2xl border border-[#ead2d8] bg-white p-6 shadow-lg">
                  <h2 className="mb-6 text-xl font-bold text-[#4a2c2a]">
                    Order Summary
                  </h2>

                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-[#6b7280]">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-[#4a2c2a]">
                        Rs. {getCartTotal()}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#6b7280]">
                      <span>Shipping</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>

                    <div className="flex justify-between text-[#6b7280]">
                      <span>GST (18%)</span>
                      <span className="font-semibold text-[#4a2c2a]">
                        Rs. {Math.round(getCartTotal() * 0.18)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 border-t border-[#ead2d8] pt-6">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#4a2c2a]">Total</span>
                      <span className="text-3xl font-bold text-[#7a1f2b]">
                        Rs. {getCartTotal()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] py-4 font-bold text-white transition-all duration-200 hover:shadow-xl hover:shadow-[#7a1f2b]/30 active:scale-95"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={20} />
                    </button>

                    <Link
                      href="/shop"
                      className="block rounded-xl border-2 border-[#7a1f2b] py-3 text-center font-bold text-[#7a1f2b] transition-colors hover:bg-[#f7e7ea]"
                    >
                      Continue Shopping
                    </Link>
                  </div>

                  <div className="mt-6 text-center text-xs text-[#6b7280]">
                    Secure checkout with SSL encryption
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
}
