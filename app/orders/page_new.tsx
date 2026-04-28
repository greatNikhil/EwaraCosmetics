'use client';

import { useOrders } from '@/hooks/useOrders';
import OrderCard from '@/components/orders/OrderCard';
import Link from 'next/link';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7e7ea] to-white pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#7a1f2b] rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Orders</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7e7ea] to-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#7a1f2b] to-[#5c1721] rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600 ml-14">Track and manage all your orders in one place</p>
        </div>

        {/* Empty State */}
        {orders && orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f7e7ea] rounded-full mb-6">
              <ShoppingBag className="w-10 h-10 text-[#7a1f2b]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start shopping to see your orders here. Browse our collection of premium beauty products.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders &&
              orders.map((order) => (
                <div key={order._id} className="transition-all duration-300 hover:shadow-lg">
                  <OrderCard order={order} />
                </div>
              ))}
          </div>
        )}

        {/* Help Section */}
        {orders && orders.length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-[#ead2d8]">
            <p className="text-gray-700">
              Need help with an order?{' '}
              <Link
                href="/help"
                className="text-[#7a1f2b] font-semibold hover:underline"
              >
                Contact our support team
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
