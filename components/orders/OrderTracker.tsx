"use client";

interface OrderTrackerProps {
  order: any;
  onReturn?: () => void;
  onExchange?: () => void;
  onBuyAgain?: () => void | Promise<void>;
}

export default function OrderTracker({
  order,
  onReturn,
  onExchange,
  onBuyAgain,
}: OrderTrackerProps) {
  const steps = [
    {
      label: "Order Placed",
      key: "pending",
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Today",
    },
    {
      label: "Processing",
      key: "processing",
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Today",
    },
    {
      label: "Shipped",
      key: "shipped",
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Today",
    },
    {
      label: "Delivered",
      key: "delivered",
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Today",
    },
  ];

  // Determine which step is active based on order status (MongoDB status format)
  const getActiveStep = () => {
    const statusMap: Record<string, number> = {
      Pending: 0,
      Processing: 1,
      Shipped: 2,
      Delivered: 3,
      Cancelled: -1,
    };
    return statusMap[order.status] ?? -1;
  };

  const activeStep = getActiveStep();
  const isCancelled = order.status === "Cancelled";
  const orderId = order?._id || "N/A";
  const deliveredStep = steps[3];
  const handleReturn =
    typeof onReturn === "function"
      ? onReturn
      : typeof order?.onReturn === "function"
        ? order.onReturn
        : () => {};
  const handleExchange =
    typeof onExchange === "function"
      ? onExchange
      : typeof order?.onExchange === "function"
        ? order.onExchange
        : () => {};
  const handleBuyAgain =
    typeof onBuyAgain === "function"
      ? onBuyAgain
      : typeof order?.onBuyAgain === "function"
      ? order.onBuyAgain
      : typeof order?.onReorder === "function"
        ? order.onReorder
        : () => {};

  if (isCancelled) {
    return (
      <div className="rounded-[20px] border border-red-200 bg-red-50 p-8 text-center">
        <div className="mb-4 text-5xl">X</div>
        <h3 className="text-2xl font-semibold text-red-900">Order Cancelled</h3>
        <p className="mt-2 text-red-700">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#7b1d3a]/10 bg-white shadow-[0_12px_40px_rgba(74,26,107,0.08)]">
      <div className="bg-[linear-gradient(135deg,#4a1a6b,#7b1d3a)] px-6 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-[0.01em]">
              Delivery Status
            </p>
            <p className="mt-1 text-sm text-white/80">
              Order ID: <span className="font-medium text-white">{orderId}</span>
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {order.status || "Delivered"}
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-[#b7ddb9] bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Delivery confirmed. Your order has been successfully processed through the latest status update.
        </div>
      </div>

      <div className="bg-[#fdf5f7] px-4 py-8 sm:px-8">
        <div className="rounded-[24px] border border-[#f0e4e8] bg-white p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-x-4">
            {steps.map((step, index) => {
              const isCompleted = index < activeStep;
              const isCurrentStep = index === activeStep;

              return (
                <div
                  key={step.key}
                  className="relative flex flex-col items-center text-center"
                >
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-5 hidden h-[2px] w-full md:block">
                      <div className="h-full w-full bg-[#e7d6dc]" />
                      <div
                        className={`absolute inset-y-0 left-0 ${
                          activeStep > index
                            ? "w-full bg-[#7b1d3a]"
                            : activeStep === index
                              ? "w-1/2 bg-[#4a1a6b]"
                              : "w-0"
                        }`}
                      />
                    </div>
                  )}

                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? "border-[#7b1d3a] bg-[#7b1d3a] text-white shadow-[0_0_0_6px_#f4d0da]"
                        : isCurrentStep
                          ? "border-[#4a1a6b] bg-[#4a1a6b] text-white shadow-[0_0_0_6px_rgba(74,26,107,0.12)]"
                          : "border-[#d1d5db] bg-white text-[#9ca3af]"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>

                  <p
                    className={`mt-3 text-sm font-semibold ${
                      isCompleted || isCurrentStep
                        ? "text-[#4a1a6b]"
                        : "text-[#6b7280]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-[#8b7d84]">{step.date}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-[#c8e6c9] border-l-[6px] border-l-[#2e7d32] bg-[#e8f5e9] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">📦</span>
            <div>
              <p className="text-base font-semibold text-[#1f5f24]">Delivered</p>
              <p className="mt-1 text-sm text-[#2e7d32]">
                Order safely delivered
              </p>
              <p className="mt-1 text-xs text-[#4b6f4d]">{deliveredStep?.date}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleReturn}
            className="rounded-2xl border border-[#7b1d3a] bg-white px-4 py-3 text-sm font-semibold text-[#7b1d3a] transition hover:bg-[#fff7f9]"
          >
            ↩ Return
          </button>
          <button
            type="button"
            onClick={handleExchange}
            className="rounded-2xl border border-[#4a1a6b] bg-white px-4 py-3 text-sm font-semibold text-[#4a1a6b] transition hover:bg-[#faf7fd]"
          >
            ⇄ Exchange
          </button>
          <button
            type="button"
            onClick={handleBuyAgain}
            className="rounded-2xl bg-[linear-gradient(135deg,#4a1a6b,#7b1d3a)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(74,26,107,0.18)] transition hover:opacity-95"
          >
            🛍 Buy Again
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-[22px] border-t border-[#f0e4e8] bg-[#fdf5f7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5a1228]">
              Rate your delivery experience
            </p>
            <p className="mt-2 text-lg tracking-[0.2em] text-[#d4a017]">
              ★★★★★
            </p>
          </div>

          <button
            type="button"
            onClick={() => {}}
            className="text-sm font-semibold text-[#7b1d3a] transition hover:text-[#5a1228]"
          >
            Rate Now ›
          </button>
        </div>
      </div>
    </div>
  );
}
