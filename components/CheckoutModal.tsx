"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, X, Check, Truck, CreditCard, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import AddressSelectorModal from "./checkout/AddressSelectorModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutModal({
  isOpen,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();
  const { items: cartItems, getTotalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("razorpay");
  const [expandedPayment, setExpandedPayment] = useState("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<any>(null);

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

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      try {
        const userKey = user?.email || user?.phone;
        if (userKey) {
          const addresses = localStorage.getItem(`addresses_${userKey}`);
          if (addresses) {
            const parsedAddresses = JSON.parse(addresses);
            const defaultAddress = parsedAddresses.find(
              (addr: any) => addr.default
            );
            if (defaultAddress) {
              setUserAddress(defaultAddress);
            }
          }
        }
      } catch (error) {
        console.error("CHECKOUT DATA ERROR:", error);
      }
    };

    loadCheckoutData();
  }, [isOpen, router, token, user]);

  useEffect(() => {
    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  const handleRazorpayCheckout = async () => {
    if (!cartItems.length) {
      alert("Cart is empty");
      return;
    }

    if (!userAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      const total = getTotalPrice();

      // Create Razorpay order
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/razorpay`,
        {
          items: cartItems,
          customerEmail: user?.email,
          customerPhone: user?.phone,
          total: total,
          shippingAddress: userAddress,
        }
      );

      const { orderId, amount, key_id } = response.data;

      if (!window.Razorpay) {
        alert("Razorpay is not loaded. Please refresh and try again.");
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: key_id,
        amount: amount, // in paise
        currency: 'INR',
        name: 'Ewara Cosmetics',
        description: `Order with ${cartItems.length} items`,
        order_id: orderId,
        handler: async function (response: any) {
          console.log('✅ Payment successful:', response);

          // Verify payment on backend
          try {
            const orderRes = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                items: cartItems,
                shippingAddress: userAddress,
                total: total,
                paymentMethod: "Razorpay",
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const mongoOrderId = orderRes.data.order._id;
            clearCart();
            setIsProcessing(false);
            onClose();
            alert("✅ Payment successful! Order created.");
            router.push(`/order-success/${mongoOrderId}`);
          } catch (error: any) {
            console.error('Order creation error:', error);
            alert('Payment verified but order creation failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#7a1f2b',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert('❌ Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error('Razorpay checkout error:', error);
      alert(error.response?.data?.error || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentOptions = [
    {
      id: "razorpay",
      name: "Razorpay - All Methods",
      icon: "💳",
      description: "Cards, UPI, Wallets, NetBanking",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "💳",
      description: "Visa, Mastercard, RuPay",
    },
    {
      id: "upi",
      name: "UPI",
      icon: "📲",
      description: "Google Pay, PhonePe, PayTM",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: "🏦",
      description: "All major banks",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: "💵",
      description: "₹50 COD charges",
    },
  ];

  const subtotal = getTotalPrice();
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
  const total = subtotal - discount + gst + shipping;

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    if (!userAddress) {
      alert("Please add/select an address first");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // If Razorpay is selected, use Razorpay checkout
    if (selectedPayment === "razorpay") {
      handleRazorpayCheckout();
      return;
    }

    // For other payment methods (COD, etc)
    setIsProcessing(true);

    try {
      const paymentMethod =
        paymentOptions.find((p) => p.id === selectedPayment)?.name || "COD";

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        {
          items: cartItems,
          totalAmount: getTotalPrice(),
          paymentMethod,
          shippingAddress: userAddress,
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
        <div className="max-h-[90vh] w-full max-w-2xl animate-slideUp overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ead2d8] bg-white px-6 py-4">
            <button
              onClick={handleClose}
              className="p-2 -ml-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200"
            >
              <ArrowLeft size={20} className="text-[#4a2c2a]" />
            </button>
            <h1 className="text-lg font-bold text-[#4a2c2a]">Order Checkout</h1>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-[#4a2c2a]" />
            </button>
          </div>

          <div className="no-scrollbar max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* Order Items Summary */}
            <div className="border-b border-[#ead2d8] bg-[#fdf8f6] px-6 py-5">
              <h2 className="text-sm font-bold text-[#4a2c2a] uppercase tracking-wide mb-3">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b7280]">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-[#4a2c2a]">₹{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b7280]">GST (18%)</span>
                  <span className="font-semibold text-[#4a2c2a]">₹{gst}</span>
                </div>
                {shipping > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6b7280]">COD Charges</span>
                    <span className="font-semibold text-[#4a2c2a]">₹{shipping}</span>
                  </div>
                )}
                <div className="border-t border-[#ead2d8] pt-3 flex justify-between items-center">
                  <span className="font-bold text-[#4a2c2a]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#7a1f2b]">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="border-b border-[#ead2d8] px-6 py-5">
              <h3 className="text-sm font-bold text-[#4a2c2a] uppercase tracking-wide mb-3">
                Apply Coupon
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-[#ead2d8] px-4 py-3 text-sm text-[#4a2c2a] placeholder-[#b5a9a4] focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 outline-none transition-all duration-200"
                />
                <button
                  className="px-6 py-3 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-[#6b7280] mt-2">Try: EWARA10 (10% off) or FLAT50 (₹50 off)</p>
            </div>

            {/* Delivery Address */}
            <div className="border-b border-[#ead2d8] px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#7a1f2b]" />
                  <h3 className="text-sm font-bold text-[#4a2c2a] uppercase tracking-wide">
                    Delivery Address
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddressSelector(true)}
                  className="text-sm font-semibold text-[#7a1f2b] hover:text-[#5c1721] transition-colors duration-200"
                >
                  Change
                </button>
              </div>

              {userAddress ? (
                <div className="bg-[#fdf8f6] rounded-lg p-4 border border-[#ead2d8]">
                  <p className="font-semibold text-[#4a2c2a] mb-1">{userAddress.name}</p>
                  <p className="text-sm text-[#6b7280] mb-2">{userAddress.address}</p>
                  <p className="text-sm text-[#6b7280] mb-2">
                    {userAddress.city}, {userAddress.state} - {userAddress.pincode}
                  </p>
                  <p className="text-sm text-[#6b7280]">{userAddress.phone}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">⚠️ No address added. Please select a delivery address.</p>
                </div>
              )}

              {/* Delivery Timeline */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 text-sm">Express Delivery</p>
                  <p className="text-xs text-green-700 mt-1">
                    Estimated delivery by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-[#7a1f2b]" />
                <h3 className="text-sm font-bold text-[#4a2c2a] uppercase tracking-wide">
                  Payment Method
                </h3>
              </div>

              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <div key={option.id} className="border border-[#ead2d8] rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedPayment(option.id);
                        setExpandedPayment(expandedPayment === option.id ? "" : option.id);
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-all duration-200 ${
                        selectedPayment === option.id
                          ? "bg-[#f7e7ea] border-[#7a1f2b]"
                          : "hover:bg-[#fdf8f6]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all duration-200 ${
                          selectedPayment === option.id ? "bg-[#7a1f2b] text-white" : "bg-[#f7e7ea]"
                        }`}>
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[#4a2c2a]">{option.name}</p>
                          <p className="text-xs text-[#6b7280]">{option.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedPayment === option.id && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7a1f2b]">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        {expandedPayment === option.id ? (
                          <ChevronUp size={18} className="text-[#6b7280]" />
                        ) : (
                          <ChevronDown size={18} className="text-[#6b7280]" />
                        )}
                      </div>
                    </button>

                    {expandedPayment === option.id && (
                      <div className="border-t border-[#ead2d8] bg-[#fdf8f6] px-4 py-4">
                        {option.id === "upi" && (
                          <div className="text-center">
                            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-gray-200">
                              <span className="text-sm text-gray-500">QR Code Placeholder</span>
                            </div>
                            <button className="rounded-lg bg-[#7a1f2b] px-6 py-2 text-sm font-medium text-white hover:bg-[#5c1721] transition-colors duration-200">
                              Show QR Code
                            </button>
                          </div>
                        )}

                        {option.id === "card" && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Card number"
                              className="w-full rounded-lg border border-[#ead2d8] px-4 py-2.5 text-sm focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="rounded-lg border border-[#ead2d8] px-4 py-2.5 text-sm focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 outline-none"
                              />
                              <input
                                type="text"
                                placeholder="CVV"
                                className="rounded-lg border border-[#ead2d8] px-4 py-2.5 text-sm focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {option.id === "cod" && (
                          <div className="py-2 text-center">
                            <p className="text-sm text-[#6b7280]">
                              Pay ₹{total} in cash when your order is delivered
                            </p>
                          </div>
                        )}

                        {option.id !== "upi" && option.id !== "card" && option.id !== "cod" && (
                          <div className="py-4 text-center">
                            <p className="text-sm text-[#6b7280]">
                              {option.name} payment option will be available at checkout
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

          {/* Footer CTA */}
          <div className="sticky bottom-0 border-t border-[#ead2d8] bg-white px-6 py-5">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !userAddress}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white font-bold rounded-lg hover:shadow-xl hover:shadow-[#7a1f2b]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              <span>{isProcessing ? "Processing..." : `Pay ₹${total} Now`}</span>
            </button>
            <p className="text-center text-xs text-[#6b7280] mt-3">
              ✓ Secure & encrypted checkout
            </p>
          </div>
        </div>
      </div>

      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md animate-slideUp rounded-t-3xl bg-white p-6 sm:rounded-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <X size={24} className="text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#4a2c2a]">
                Exit Checkout?
              </h3>
              <p className="mb-6 text-sm text-[#6b7280]">
                Your cart items and preferences will be saved for later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 rounded-lg bg-red-500 py-3 font-semibold text-white hover:bg-red-600 transition-colors duration-200"
                >
                  Yes, Exit
                </button>
                <button
                  onClick={cancelExit}
                  className="flex-1 rounded-lg border-2 border-[#ead2d8] py-3 font-semibold text-[#4a2c2a] hover:bg-[#f7e7ea] transition-colors duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Selector Modal */}
      <AddressSelectorModal
        isOpen={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        user={user}
        onAddressChange={(address) => {
          setUserAddress(address);
        }}
      />
    </>
  );
}