"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ChevronRight,
  X,
  Check,
  Truck,
  CreditCard,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { buildApiUrl } from "@/utils/api";
import { clearCart as clearStoredCart, syncCartWithCatalog } from "@/utils/cart";
import AddressSelectorModal from "./checkout/AddressSelectorModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentOption = {
  id: string;
  name: string;
  icon: string;
  description: string;
  gatewayLabel?: string;
  online?: boolean;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PENDING_RAZORPAY_ORDER_PREFIX = "ewara_pending_razorpay_order_";

const getRazorpayFailureMessage = (error: any) => {
  const code = error?.code || error?.error_code;
  const step = error?.step;
  const reason =
    error?.description ||
    error?.reason ||
    error?.source ||
    "Payment could not be completed";

  const details = [code, step].filter(Boolean).join(" | ");
  return details ? `${reason} (${details})` : reason;
};

export default function CheckoutModal({
  isOpen,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();
  const { items: cartItems, getTotalPrice } = useCartStore();
  const { user, token, addresses: savedAddresses, setAddresses } = useAuthStore();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("online");
  const [expandedPayment, setExpandedPayment] = useState("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<any>(null);

  useEffect(() => {
    const fallbackAddress =
      savedAddresses.find((address) => address.default) || savedAddresses[0] || null;

    if (fallbackAddress) {
      setUserAddress((currentAddress: any) => currentAddress || fallbackAddress);
    }
  }, [savedAddresses]);

  const normalizedOrderItems = cartItems.map((item) => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const normalizedShippingAddress = userAddress
    ? {
        fullName: [userAddress.name, userAddress.lastname]
          .filter(Boolean)
          .join(" ")
          .trim(),
        phoneNumber: userAddress.phone,
        addressLine1: userAddress.address,
        addressLine2: userAddress.flat || "",
        city: userAddress.city,
        state: userAddress.state,
        postalCode: userAddress.pincode,
        country: "India",
      }
    : null;

  const subtotal = getTotalPrice();

  const paymentOptions: PaymentOption[] = [
    {
      id: "online",
      name: "All Online Methods",
      icon: "RP",
      description: "Cards, UPI, wallets, net banking, EMI and pay later",
      gatewayLabel: "Razorpay",
      online: true,
    },
    {
      id: "card",
      name: "Credit / Debit Card",
      icon: "CC",
      description: "Visa, Mastercard, RuPay and supported card offers",
      gatewayLabel: "Razorpay - Card",
      online: true,
    },
    {
      id: "upi",
      name: "UPI",
      icon: "UPI",
      description: "Google Pay, PhonePe, Paytm and supported UPI apps",
      gatewayLabel: "Razorpay - UPI",
      online: true,
    },
    {
      id: "wallet",
      name: "Wallets",
      icon: "WLT",
      description: "Supported wallets enabled on your Razorpay account",
      gatewayLabel: "Razorpay - Wallet",
      online: true,
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: "NB",
      description: "Popular Indian banks through Razorpay checkout",
      gatewayLabel: "Razorpay - Net Banking",
      online: true,
    },
    {
      id: "emi",
      name: "EMI",
      icon: "EMI",
      description: "Eligible card EMI plans enabled in Razorpay",
      gatewayLabel: "Razorpay - EMI",
      online: true,
    },
    {
      id: "paylater",
      name: "Pay Later",
      icon: "PL",
      description: "Eligible pay later partners enabled for your account",
      gatewayLabel: "Razorpay - Pay Later",
      online: true,
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: "COD",
      description: "Pay on delivery with Rs. 50 COD charges",
    },
  ];

  const getPaymentOptionById = (paymentId: string) =>
    paymentOptions.find((option) => option.id === paymentId);

  const getRazorpayConfig = (paymentId: string) => {
    const paymentBlocks: Record<
      string,
      { blockCode: string; blockName: string; method: string }
    > = {
      card: {
        blockCode: "cards_only",
        blockName: "Pay via Card",
        method: "card",
      },
      upi: {
        blockCode: "upi_only",
        blockName: "Pay via UPI",
        method: "upi",
      },
      wallet: {
        blockCode: "wallet_only",
        blockName: "Pay via Wallet",
        method: "wallet",
      },
      netbanking: {
        blockCode: "netbanking_only",
        blockName: "Pay via Net Banking",
        method: "netbanking",
      },
      emi: {
        blockCode: "emi_only",
        blockName: "Pay via EMI",
        method: "emi",
      },
      paylater: {
        blockCode: "paylater_only",
        blockName: "Pay via Pay Later",
        method: "paylater",
      },
    };

    const selectedBlock = paymentBlocks[paymentId];

    if (!selectedBlock) {
      return undefined;
    }

    return {
      display: {
        blocks: {
          [selectedBlock.blockCode]: {
            name: selectedBlock.blockName,
            instruments: [
              {
                method: selectedBlock.method,
              },
            ],
          },
        },
        sequence: [`block.${selectedBlock.blockCode}`],
        preferences: {
          show_default_blocks: false,
        },
      },
    };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Enter a coupon code");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/coupons/validate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.coupon) {
        alert(data.message || "Invalid coupon");
        return;
      }

      setAppliedCoupon(data.coupon);
    } catch (error) {
      console.error("COUPON APPLY ERROR:", error);
      alert("Failed to validate coupon");
    }
  };

  useEffect(() => {
    const loadCheckoutData = async () => {
      if (!isOpen) return;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/addresses"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          return;
        }

        const nextAddresses = data.addresses || [];
        setAddresses(nextAddresses);
        const defaultAddress =
          nextAddresses.find((addr: any) => addr.default) ||
          nextAddresses[0] ||
          null;

        setUserAddress(defaultAddress);
      } catch (error) {
        console.error("CHECKOUT DATA ERROR:", error);
      }
    };

    loadCheckoutData();
  }, [isOpen, router, token, user]);

  useEffect(() => {
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

  const redirectToOrderSuccess = (orderId: string | number) => {
    const successPath = `/order-success/${orderId}`;

    onClose();
    router.push(successPath);

    window.setTimeout(() => {
      if (window.location.pathname !== successPath) {
        window.location.assign(successPath);
      }
    }, 250);
  };

  const persistPendingRazorpayOrder = (
    razorpayOrderId: string,
    paymentMethodLabel: string
  ) => {
    if (typeof window === "undefined") {
      return;
    }

    const pendingOrderPayload = {
      razorpayOrderId,
      items: normalizedOrderItems,
      shippingAddress: normalizedShippingAddress,
      totalAmount: total,
      paymentMethod: paymentMethodLabel,
      couponCode: activeCouponCode,
    };

    window.sessionStorage.setItem(
      `${PENDING_RAZORPAY_ORDER_PREFIX}${razorpayOrderId}`,
      JSON.stringify(pendingOrderPayload)
    );
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

    if (!normalizedShippingAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      const selectedPaymentOption = getPaymentOptionById(selectedPayment);
      const checkoutConfig = getRazorpayConfig(selectedPayment);
      const onlinePaymentLabel =
        selectedPaymentOption?.gatewayLabel || "Razorpay";

      const response = await axios.post("/api/checkout/razorpay", {
        items: normalizedOrderItems,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        totalAmount: total,
        shippingAddress: normalizedShippingAddress,
        paymentOption: selectedPayment,
        paymentMethodLabel: onlinePaymentLabel,
      });

      const checkoutData = response.data?.data;

      if (!response.data?.success || !checkoutData) {
        alert(response.data?.message || "Failed to create Razorpay order");
        setIsProcessing(false);
        return;
      }

      const { orderId, amount, key_id } = checkoutData;
      persistPendingRazorpayOrder(orderId, onlinePaymentLabel);

      if (!window.Razorpay) {
        alert("Razorpay is not loaded. Please refresh and try again.");
        return;
      }

      const options = {
        key: key_id,
        amount,
        currency: "INR",
        name: "Ewara Cosmetics",
        description: `${onlinePaymentLabel} payment for ${cartItems.length} item${cartItems.length > 1 ? "s" : ""}`,
        order_id: orderId,
        config: checkoutConfig,
        handler: async (response: any) => {
          try {
            const callbackParams = new URLSearchParams({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            window.location.assign(
              `/checkout/razorpay-return?${callbackParams.toString()}`
            );
          } catch (error: any) {
            console.error("Order creation error:", error);
            alert(
              error?.response?.data?.message ||
                error?.message ||
                "Payment successful but redirect failed. Please contact support."
            );
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#7a1f2b",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        console.error("Payment failed:", response.error);
        const failureMessage = getRazorpayFailureMessage(response.error);
        try {
          await axios.post(
            buildApiUrl("/api/orders/payment-failure"),
            {
              amount: total,
              reason: failureMessage,
              razorpayOrderId: response.error?.metadata?.order_id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (notifyError) {
          console.error("PAYMENT FAILURE NOTIFY ERROR:", notifyError);
        }
        alert(`Payment failed: ${failureMessage}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Razorpay checkout error:", error);
      alert(error.response?.data?.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const rawDiscount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round(subtotal * (Number(appliedCoupon.value || 0) / 100))
      : Number(appliedCoupon.value ?? appliedCoupon.discountAmount ?? 0)
    : 0;
  const discount = Math.min(Math.max(rawDiscount, 0), subtotal);
  const taxableAmount = Math.max(subtotal - discount, 0);
  const shipping = selectedPayment === "cod" ? 50 : 0;
  const gst = Math.round(taxableAmount * 0.18);
  const total = taxableAmount + gst + shipping;
  const activeCouponCode =
    appliedCoupon && discount > 0 ? appliedCoupon.code : undefined;
  const selectedPaymentOption = getPaymentOptionById(selectedPayment);

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!normalizedShippingAddress) {
      alert("Please add/select an address first");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const { removedCount, updatedCount, quantityAdjustedCount } =
      await syncCartWithCatalog();
    if (removedCount > 0 || updatedCount > 0 || quantityAdjustedCount > 0) {
      alert(
        "Your cart was refreshed with the latest product availability, prices, or quantities. Please review the updated total and place the order again."
      );
      return;
    }

    if (selectedPaymentOption?.online) {
      handleRazorpayCheckout();
      return;
    }

    setIsProcessing(true);

    try {
      const paymentMethod = selectedPaymentOption?.name || "COD";

      const res = await axios.post(
        buildApiUrl("/api/orders"),
        {
          items: normalizedOrderItems,
          totalAmount: total,
          paymentMethod,
          shippingAddress: normalizedShippingAddress,
          couponCode: activeCouponCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const orderId = res.data.order._id;
        await clearStoredCart();
        setIsProcessing(false);
        alert("Order placed successfully.");
        redirectToOrderSuccess(orderId);
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
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(0,0,0,0.5)] p-4 sm:items-center">
        <div className="flex h-auto max-h-[92vh] w-full max-w-2xl animate-slideUp flex-col overflow-hidden rounded-[16px] border border-[#e8d5d5] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:max-h-[90vh]">
          <div className="sticky top-0 z-10 border-b border-[#e8d5d5] bg-white px-[15px] py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClose}
                className="-ml-1 flex h-6 w-6 items-center justify-center text-[#7a1a2e] transition-colors duration-200"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-[14px] font-medium text-[#1a1a1a]">
                Order checkout
              </h1>
              <button
                onClick={handleClose}
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#f7ecec] text-[11px] text-[#7a1a2e] transition-colors duration-200"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 border-b border-[#e8d5d5] bg-white px-[15px] py-[10px]">
            <div className="flex items-center">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7a1a2e] text-[9px] font-medium text-white">
                  1
                </span>
                <span className="text-[10px] font-medium text-[#999]">
                  Summary
                </span>
              </div>
              <div className="mx-1 h-px flex-1 bg-[#e8d5d5]" />
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7a1a2e] text-[9px] font-medium text-white">
                  2
                </span>
                <span className="text-[10px] font-medium text-[#999]">
                  Address
                </span>
              </div>
              <div className="mx-1 h-px flex-1 bg-[#e8d5d5]" />
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7a1a2e] text-[9px] font-medium text-white">
                  3
                </span>
                <span className="text-[10px] font-medium text-[#999]">
                  Payment
                </span>
              </div>
            </div>
          </div>

          <div
            className="checkout-scroll-area flex-1 overflow-y-auto pb-4"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "thin",
              scrollbarColor: "#c9a0a0 transparent",
            }}
          >
            <div className="space-y-5 bg-white px-[15px] py-4">
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#7a1a2e]" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                    Order Summary
                  </h2>
                </div>
                <div className="mb-3 rounded-[10px] border border-[#e8d5d5] bg-white px-3 py-[10px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-normal text-[#3d3d3d]">
                        Subtotal ({cartItems.length} items)
                      </span>
                      <span className="text-[11px] font-medium text-[#1a1a1a]">
                        Rs. {subtotal}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-normal text-[var(--green-text)]">
                          Discount ({appliedCoupon.code})
                        </span>
                        <span className="text-[11px] font-medium text-[var(--green-text)]">
                          -Rs. {discount}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-normal text-[#3d3d3d]">
                        GST (18%)
                      </span>
                      <span className="text-[11px] font-medium text-[#1a1a1a]">
                        Rs. {gst}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-normal text-[#3d3d3d]">
                        Shipping
                      </span>
                      {shipping > 0 ? (
                        <span className="text-[11px] font-medium text-[#1a1a1a]">
                          Rs. {shipping}
                        </span>
                      ) : (
                        <span className="rounded-[4px] bg-[var(--green-bg)] px-[7px] py-[2px] text-[10px] font-medium text-[#1a1a1a]">
                          Free
                        </span>
                      )}
                    </div>
                    <div className="border-t border-[#e8d5d5] pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-bold text-[#7a1a2e]">
                          Total Amount
                        </span>
                        <span className="text-[16px] font-bold text-[#7a1a2e]">
                          Rs. {total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-[9px] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                  Apply Coupon
                </h3>
                <div className="flex gap-[6px]">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="min-w-0 flex-1 rounded-[8px] border-[1.5px] border-[#d4a0a0] bg-white px-[10px] py-[8px] text-[11px] font-normal text-[#1a1a1a] outline-none placeholder:text-[#8f7a80] focus:border-[#d4a0a0]"
                  />
                  <button
                    className="rounded-[8px] bg-[#7a1a2e] px-3 py-[8px] text-[11px] font-medium text-white transition-colors duration-200 hover:bg-[#7a1a2e]"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#7a1a2e]" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                      Delivery Address
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddressSelector(true)}
                    className="ml-auto text-[10px] font-normal text-[#7a1a2e] underline underline-offset-2 transition-colors duration-200 hover:text-[#7a1a2e]"
                  >
                    Change
                  </button>
                </div>

                {userAddress ? (
                  <div className="mb-2 rounded-[10px] border border-[#e8d5d5] bg-[#fdf6f6] px-3 py-[10px]">
                    <p className="mb-1 text-[12px] font-medium text-[#2d2d2d]">
                      {userAddress.name}
                    </p>
                    <div className="space-y-1 text-[11px] font-normal leading-[1.6] text-[#2d2d2d]">
                      <p>{userAddress.address}</p>
                      <p>
                        {userAddress.city}, {userAddress.state} - {userAddress.pincode}
                      </p>
                      <p>{userAddress.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-2 rounded-[10px] border border-[#e8d5d5] bg-[#fdf6f6] px-3 py-[10px]">
                    <p className="text-[11px] font-normal text-[#2d2d2d]">
                      No address added. Please select a delivery address.
                    </p>
                  </div>
                )}

                <div className="mb-3 flex items-start gap-2 rounded-[8px] border border-[var(--green-border)] bg-[var(--green-bg)] px-[11px] py-[8px]">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[var(--green-text)]">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[var(--green-text)]">
                      Express delivery
                    </p>
                    <p className="mt-1 text-[10px] font-normal text-[var(--green-sub)]">
                      Estimated delivery by{" "}
                      {new Date(
                        Date.now() + 3 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#7a1a2e]" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-[7px]">
                  {paymentOptions.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(option.id);
                          setExpandedPayment(expandedPayment === option.id ? "" : option.id);
                        }}
                        className={`flex w-full items-center justify-between rounded-[10px] px-3 py-[10px] text-left transition-colors duration-200 ${
                          selectedPayment === option.id
                            ? "border border-[#7a1a2e] bg-[#fff8f9]"
                            : "border border-[var(--blush-border)] bg-white hover:bg-white"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] text-[9px] font-medium ${
                              selectedPayment === option.id
                                ? "bg-[#7a1a2e] text-white"
                                : "bg-[#f7ecec] text-[#7a1a2e]"
                            }`}
                          >
                            {option.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-[#1a1a1a]">
                              {option.name}
                            </p>
                            <p className="truncate text-[10px] font-normal text-[#3d3d3d]">
                              {option.id === "cod"
                                ? "Pay when you receive"
                                : option.description}
                            </p>
                          </div>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          {selectedPayment === option.id && (
                            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#7a1a2e]">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                          <ChevronRight className="h-4 w-4 text-[#c4a090]" />
                        </div>
                      </button>

                      {expandedPayment === option.id && (
                        <div className="rounded-[10px] border border-[#e8d5d5] bg-white px-3 py-3">
                          {option.id === "cod" ? (
                            <div className="py-1 text-center">
                              <p className="text-[11px] font-normal text-[#3d3d3d]">
                                Pay Rs. {total} in cash when your order is delivered
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[11px] font-medium text-[#1a1a1a]">
                                {option.name} opens inside Razorpay checkout.
                              </p>
                              <p className="text-[11px] leading-[1.6] text-[#3d3d3d]">
                                Only the selected method is shown first for this order, subject to what is enabled on your Razorpay account.
                              </p>
                              {option.id === "upi" && (
                                <p className="text-[10px] leading-[1.6] text-[#3d3d3d]">
                                  Customers continue with supported UPI apps or QR-based flows inside Razorpay.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex-shrink-0 border-t border-[#f0e0e0] bg-white p-4">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !normalizedShippingAddress}
              className="mb-[5px] flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#7a1a2e] px-6 py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#7a1a2e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative h-[9px] w-[11px] border-[1.5px] border-white">
                <span className="absolute left-[1px] top-[-5px] h-[5px] w-[5px] rounded-t-[3px] border-[1.5px] border-b-0 border-white content-['']" />
              </span>
              <span>{isProcessing ? "Processing..." : `Pay Rs. ${total} now`}</span>
            </button>
            <p className="text-center text-[10px] font-normal text-[var(--blush-muted)]">
              Secure and encrypted checkout
            </p>
          </div>
        </div>
      </div>

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
                  className="flex-1 rounded-lg bg-red-500 py-3 font-semibold text-white transition-colors duration-200 hover:bg-red-600"
                >
                  Yes, Exit
                </button>
                <button
                  onClick={cancelExit}
                  className="flex-1 rounded-lg border-2 border-[#ead2d8] py-3 font-semibold text-[#4a2c2a] transition-colors duration-200 hover:bg-[#f7e7ea]"
                >
                  Continue
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
          setUserAddress(address);
        }}
      />
      <style jsx global>{`
        .checkout-scroll-area::-webkit-scrollbar {
          width: 8px;
        }

        .checkout-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .checkout-scroll-area::-webkit-scrollbar-thumb {
          background: #c9a0a0;
          border-radius: 999px;
        }

        .checkout-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #b58989;
        }

        @media (max-width: 768px) {
          .checkout-scroll-area {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </>
  );
}

