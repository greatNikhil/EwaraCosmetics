"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { getCartItems, getCartTotal, clearCart } from "@/utils/cart";
import { useRouter } from "next/navigation";
import AddressSelectorModal from "./checkout/AddressSelectorModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [expandedPayment, setExpandedPayment] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const coupons = [
    { code: "EWARA10", type: "percent", value: 10 },
    { code: "FLAT50", type: "flat", value: 50 },
  ];

  const handleApplyCoupon = () => {
    const found = coupons.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase()
    );

    if (!found) {
      alert("Invalid coupon");
      return;
    }

    setAppliedCoupon(found);
  };

  useEffect(() => {
    const loadCheckoutData = async () => {
      if (!isOpen) return;

      setAuthLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        router.push("/login");
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.user) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");

          alert("Session expired. Please login again");
          router.push("/login");
          setAuthLoading(false);
          return;
        }

        let parsedUser = data.user;
        const userKey = parsedUser.email || parsedUser.phone;

        if (userKey) {
          const addresses = localStorage.getItem(`addresses_${userKey}`);

          if (addresses) {
            const parsedAddresses = JSON.parse(addresses);
            const defaultAddress = parsedAddresses.find(
              (addr: any) => addr.default
            );

            if (defaultAddress) {
              parsedUser = {
                ...parsedUser,
                address: defaultAddress,
              };
            }
          }
        }

        setUser(parsedUser);
        localStorage.setItem("userData", JSON.stringify(parsedUser));
        setCart(getCartItems());
      } catch (error) {
        console.error("CHECKOUT AUTH ERROR:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");

        alert("Please login again");
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    loadCheckoutData();
  }, [isOpen, router]);

  const handleClose = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const paymentOptions = [
    {
      id: "upi",
      name: "UPI Payment",
      icon: "💳",
      description: "Save ₹12.50 by paying online",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "💳",
      description: "Visa, Mastercard, RuPay",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: "🏦",
      description: "All major banks",
    },
    {
      id: "wallets",
      name: "Wallets",
      icon: "📱",
      description: "Paytm, Mobikwik, Ola Money",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: "💵",
      description: "₹50 COD charges",
    },
  ];

  const subtotal = getCartTotal();
  let discount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  const shipping = selectedPayment === "cod" ? 50 : 0;
  const gst = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + shipping + gst;

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    if (!user.address) {
      alert("Please add/select an address first");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const paymentMethod =
        paymentOptions.find((p) => p.id === selectedPayment)?.name || "COD";

      const res = await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: orderItems,
          totalAmount: total,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const orderId = res.data.order._id;
        clearCart();
        setCart([]);
        setIsProcessing(false);
        onClose();
        alert("Order placed successfully ✅");
        router.push(`/order-success/${orderId}`);
      }
    } catch (error: any) {
      console.error("PLACE ORDER ERROR:", error);
      alert(
        error?.response?.data?.message || "Checkout failed. Please try again."
      );
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#7a1f2b] border-t-transparent" />
          <p className="font-medium text-[#7a1f2b]">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
        <div className="max-h-[90vh] w-full max-w-md animate-slideUp overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-full p-2 -ml-2 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-[#7a1f2b]">EWARA</h1>
            <div className="w-10" />
          </div>

          <div className="no-scrollbar max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order summary ({cart.length} item{cart.length > 1 ? "s" : ""})
                </h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-400 line-through">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-₹{discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{gst}</span>
                </div>
                {shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">COD Charges</span>
                    <span>₹{shipping}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-[#7a1f2b]">₹{total}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-sm font-medium text-green-700">
                  Yay! You&apos;ve saved ₹{discount}.00 so far
                </span>
              </div>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#7a1f2b] focus:outline-none"
                />
                <button
                  className="rounded-lg bg-[#7a1f2b] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5c1721]"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Unlock coupons</p>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delivery details
                </h3>
                <button
                  onClick={() => setShowAddressSelector(true)}
                  className="text-sm font-medium text-[#7a1f2b] transition hover:font-semibold"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2 text-sm">
                {user?.address ? (
                  <>
                    <p className="font-medium text-gray-900">
                      {user.address.name}
                    </p>
                    <p className="text-gray-600">{user.address.address}</p>
                    <p className="text-gray-600">
                      {user.address.city}, {user.address.state} -{" "}
                      {user.address.pincode}
                    </p>
                    <p className="text-gray-600">{user.address.phone}</p>
                  </>
                ) : (
                  <p className="italic text-gray-500">No address added</p>
                )}
                <p className="text-gray-600">
                  {user?.email || "customer@example.com"}
                </p>
              </div>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Express delivery</p>
                  <p className="font-medium text-gray-900">
                    {new Date(
                      Date.now() + 3 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Shipping charges</p>
                  <p className="font-medium text-gray-900">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Pay via
              </h3>

              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <button
                      onClick={() => {
                        setSelectedPayment(option.id);
                        setExpandedPayment(
                          expandedPayment === option.id ? "" : option.id
                        );
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-gray-50 ${
                        selectedPayment === option.id
                          ? "border-[#7a1f2b] bg-[#7a1f2b]/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg">
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {option.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedPayment === option.id && (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#7a1f2b]">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        {expandedPayment === option.id ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedPayment === option.id && (
                      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                        {option.id === "upi" && (
                          <div className="text-center">
                            <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-lg bg-gray-200">
                              <span className="text-sm text-gray-500">
                                QR Code
                              </span>
                            </div>
                            <button className="rounded-lg bg-[#7a1f2b] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5c1721]">
                              Show QR
                            </button>
                          </div>
                        )}

                        {option.id === "card" && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Card number"
                              className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-[#7a1f2b] focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="rounded border border-gray-200 px-3 py-2 text-sm focus:border-[#7a1f2b] focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="CVV"
                                className="rounded border border-gray-200 px-3 py-2 text-sm focus:border-[#7a1f2b] focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {option.id === "cod" && (
                          <div className="py-2 text-center">
                            <p className="text-sm text-gray-600">
                              Pay ₹{total} in cash when your order is delivered
                            </p>
                          </div>
                        )}

                        {option.id !== "upi" &&
                          option.id !== "card" &&
                          option.id !== "cod" && (
                            <div className="py-4 text-center">
                              <p className="text-sm text-gray-600">
                                {option.name} payment option will be available
                                at checkout
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full rounded-xl bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] py-4 text-lg font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : `Place Order • ₹${total}`}
            </button>
          </div>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-slideUp rounded-t-3xl bg-white p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <X size={24} className="text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Are you sure you want to exit?
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Your cart items and selected preferences will be saved for later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 rounded-lg bg-red-500 py-3 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Yes, exit checkout
                </button>
                <button
                  onClick={cancelExit}
                  className="flex-1 rounded-lg border border-gray-200 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  No, continue checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddressSelectorModal
        isOpen={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        user={user}
        onAddressChange={(address) => {
          setUser((prev: any) => ({
            ...prev,
            address,
          }));
        }}
      />
    </>
  );
}