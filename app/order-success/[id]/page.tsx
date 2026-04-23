"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { CheckCircle2, Package, Truck, ArrowRight, Home } from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError("Failed to load order.");
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(
          err?.response?.data?.message || "Something went wrong while loading your order."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf8f6] to-[#f7e7ea] px-4 py-10">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#f7e7ea] mb-6">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#7a1f2b] border-t-transparent" />
          </div>
          <p className="text-lg font-semibold text-[#4a2c2a]">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf8f6] to-[#f7e7ea] px-4 py-10">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#4a2c2a] mb-3">Order page unavailable</h1>
          <p className="text-[#6b7280] mb-8">{error || "Order not found."}</p>
          <button
            onClick={() => router.push("/orders")}
            className="w-full bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const totalItems = order.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f6] to-[#f7e7ea] px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-500">
                <CheckCircle2 size={56} className="text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#4a2c2a] mb-3">
            Order Confirmed!
          </h1>
          <p className="text-lg text-[#6b7280] max-w-xl mx-auto">
            Thank you for your purchase. Your order has been successfully placed and is being prepared for shipment.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border-b border-[#ead2d8]">
            <div className="px-6 md:px-8 py-8 border-r border-[#ead2d8] md:border-r-1 last:border-r-0">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-5 w-5 text-[#7a1f2b]" />
                <p className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide">Order ID</p>
              </div>
              <p className="text-[#4a2c2a] font-bold text-lg break-all">{order._id}</p>
            </div>

            <div className="px-6 md:px-8 py-8 border-r border-[#ead2d8] md:border-r-1 last:border-r-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 w-5 text-[#7a1f2b]">💳</div>
                <p className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide">Payment</p>
              </div>
              <p className="text-[#4a2c2a] font-bold text-lg">{order.paymentMethod}</p>
            </div>

            <div className="px-6 md:px-8 py-8">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-[#7a1f2b]" />
                <p className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide">Status</p>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100">
                <p className="font-bold text-lg text-blue-700">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="px-6 md:px-8 py-8">
            <h2 className="text-xl font-bold text-[#4a2c2a] mb-2 uppercase tracking-wide">Order Summary</h2>
            <p className="text-sm text-[#6b7280] mb-6">You ordered {totalItems} item{totalItems > 1 ? 's' : ''}</p>

            {/* Items List */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b border-[#ead2d8] last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-semibold text-[#4a2c2a]">{item.name}</p>
                    <p className="text-sm text-[#6b7280]">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-bold text-[#7a1f2b] text-lg ml-4">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-r from-[#fdf8f6] to-[#f7e7ea] rounded-2xl p-6 border border-[#ead2d8]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#6b7280] font-medium">Items ({totalItems})</span>
                <span className="text-[#4a2c2a] font-semibold">₹{order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#ead2d8]">
                <span className="text-lg font-bold text-[#4a2c2a]">Total</span>
                <span className="text-3xl font-bold text-[#7a1f2b]">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4 mb-6">
          {/* Primary CTA */}
          <button
            onClick={() => router.push(`/orders/${order._id}`)}
            className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white py-4 font-bold text-lg hover:shadow-xl hover:shadow-[#7a1f2b]/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>View Order Tracking</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border-2 border-[#7a1f2b] text-[#7a1f2b] py-4 font-bold text-lg hover:bg-[#f7e7ea] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Secondary Button */}
        <button
          onClick={() => router.push("/orders")}
          className="w-full text-center text-[#6b7280] font-medium py-3 hover:text-[#7a1f2b] transition-colors"
        >
          View All My Orders →
        </button>
      </div>
    </div>
  );
}