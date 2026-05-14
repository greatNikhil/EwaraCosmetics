"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildApiUrl } from "@/utils/api";
import OrderTracker from "@/components/orders/OrderTracker";
import ReturnExchangeModal from "@/components/orders/ReturnExchangeModal";
import { ArrowLeft } from "lucide-react";
import { addToCart } from "@/utils/cart";
import { getClientToken } from "@/utils/clientAuth";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnExchangeModal, setShowReturnExchangeModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = getClientToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(buildApiUrl(`/api/orders/${id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError("Order not found or access denied");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error("ORDER DETAILS ERROR:", error);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7e7ea] to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#7a1f2b]"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7e7ea] to-white pt-24 px-4">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-[#7a1f2b] hover:underline mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 text-lg font-medium">
              {error || "Order not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      "Pending": { bg: "bg-yellow-100", text: "text-yellow-800", label: "Awaiting Payment" },
      "Processing": { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
      "Shipped": { bg: "bg-purple-100", text: "text-purple-800", label: "Shipped" },
      "Delivered": { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
      "Cancelled": { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
    };
    return badges[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
  };

  // Payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      "Completed": { bg: "bg-green-100", text: "text-green-800", label: "✓ Completed" },
      "Pending": { bg: "bg-yellow-100", text: "text-yellow-800", label: "⏳ Pending" },
      "Failed": { bg: "bg-red-100", text: "text-red-800", label: "✗ Failed" },
    };
    return badges[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
  };

  const statusBadge = getStatusBadge(order.status);
  const paymentStatusBadge = getPaymentStatusBadge(order.paymentStatus);

  const handleReturn = () => {
    setShowReturnExchangeModal(true);
  };

  const handleBuyAgain = async () => {
    if (!Array.isArray(order.items) || order.items.length === 0) return;

    for (const item of order.items) {
      const productId = item.productId || item._id || item.id;
      if (!productId) continue;

      for (let count = 0; count < (item.quantity || 1); count += 1) {
        await addToCart({
          _id: productId,
          name: item.name || item.productName || "Product",
          price: item.price ?? 0,
          images: [item.image || "/favicon/product.jpeg"],
          category: item.category,
          brand: item.brand,
        });
      }
    }

    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7e7ea] to-white pt-24 pb-16 px-4 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-[#7a1f2b] hover:underline mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-[#4a2c2a] mb-8">Order Details</h1>

        {/* Order Header Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order ID & Date */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900 break-all">
                {order._id}
              </p>
              <p className="text-sm text-gray-500 mt-4">Order Date</p>
              <p className="text-gray-900 font-medium">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Status & Payment */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Order Status</p>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.bg} ${statusBadge.text} mb-4`}
              >
                {statusBadge.label}
              </div>

              <p className="text-sm text-gray-600 mt-4 mb-2">Payment Method</p>
              <p className="text-gray-900 font-medium">
                {order.paymentMethod}
              </p>
              
              <p className="text-sm text-gray-600 mt-4 mb-2">Payment Status</p>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${paymentStatusBadge.bg} ${paymentStatusBadge.text}`}
              >
                {paymentStatusBadge.label}
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <OrderTracker
            order={order}
            onReturn={handleReturn}
            onBuyAgain={handleBuyAgain}
          />
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Items</h2>

          <div className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <img
                  src={item.image || "/fallback.png"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e: any) => {
                    e.target.src = "/fallback.png";
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: ₹{item.price.toLocaleString("en-IN")} each
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-semibold text-[#7a1f2b]">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pricing Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Price Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{order.subtotalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-semibold">
                    -₹{order.discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-semibold text-gray-900">
                  ₹{order.gstAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">
                  {order.shippingAmount === 0 ? "Free" : `₹${order.shippingAmount.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="flex justify-between border-t-2 border-[#7a1f2b] pt-3 mt-3 bg-[#fdf8f6] -mx-6 px-6 py-3">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#7a1f2b]">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h3>
            
            {order.shippingAddress ? (
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-sm">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && (
                    <>
                      <br />
                      {order.shippingAddress.addressLine2}
                    </>
                  )}
                </p>
                <p className="text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm">{order.shippingAddress.country}</p>
                <p className="text-sm font-medium text-gray-600 mt-3">
                  📞 {order.shippingAddress.phoneNumber}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No shipping address available</p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-800 text-sm">
            For order updates and inquiries, contact our support team. You can also track 
            your package status using the timeline above.
          </p>
        </div>
      </div>

      {/* Modals */}
      <ReturnExchangeModal
        isOpen={showReturnExchangeModal}
        onClose={() => setShowReturnExchangeModal(false)}
        orderId={order._id}
        productName={order.items?.[0]?.name}
      />
    </div>
  );
}
