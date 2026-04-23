"use client";

import { Order } from "@/utils/orderUtils";

interface OrderTrackerProps {
  order: Order;
}

export default function OrderTracker({ order }: OrderTrackerProps) {
  const steps = [
    { label: "Order Placed", key: "placed", date: order.date },
    { label: "Shipped", key: "shipped", date: order.date },
    {
      label: "Delivered",
      key: "delivered",
      date: order.deliveryDate || order.date,
    },
  ];

  // Determine which step is active based on order status
  const getActiveStep = () => {
    const statusMap: Record<string, number> = {
      placed: 0,
      shipped: 1,
      delivered: 2,
      cancelled: -1,
    };
    return statusMap[order.status] ?? -1;
  };

  const activeStep = getActiveStep();
  const isCancelled = order.status === "cancelled";

  if (isCancelled) {
    return (
      <div className="rounded-[20px] border border-red-200 bg-red-50 p-8 text-center">
        <div className="mb-4 text-5xl">❌</div>
        <h3 className="text-2xl font-semibold text-red-900">Order Cancelled</h3>
        <p className="mt-2 text-red-700">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[#7a1f2b]/10 bg-white p-8">
      <h3 className="mb-8 text-xl font-semibold text-[#4a1a1f]">
        Delivery Status
      </h3>

      {/* Timeline */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute left-[27px] top-12 h-[calc(100%-3rem)] w-0.5 bg-[#d1d5db]" />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isActive = index <= activeStep;
            const isCurrentStep = index === activeStep;

            return (
              <div key={step.key} className="relative pl-20">
                {/* Circle indicator */}
                <div
                  className={`absolute -left-3.5 top-1 h-7 w-7 rounded-full border-4 transition-all duration-500 ${
                    isActive
                      ? "border-[#7a1f2b] bg-[#7a1f2b]"
                      : "border-[#d1d5db] bg-white"
                  }`}
                >
                  {isActive && (
                    <div className="flex h-full w-full items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className={isCurrentStep ? "opacity-100" : "opacity-75"}>
                  <p
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isActive ? "text-[#7a1f2b]" : "text-[#6b7280]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    {new Date(step.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  {/* Delivery partner info for shipped step */}
                  {isCurrentStep && step.key === "shipped" && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f7e9e7] px-3 py-2">
                      <span className="text-xl">🚚</span>
                      <div className="text-sm">
                        <p className="font-medium text-[#7a1f2b]">On the way</p>
                        <p className="text-xs text-[#7a1f2b]/70">
                          {order.trackingNumber
                            ? `Tracking: ${order.trackingNumber}`
                            : "Tracking info coming soon"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Arrived info for delivered step */}
                  {isCurrentStep && step.key === "delivered" && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                      <span className="text-xl">📦</span>
                      <div className="text-sm">
                        <p className="font-medium text-green-700">Delivered</p>
                        <p className="text-xs text-green-600">
                          Order safely delivered
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
