"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { buildApiUrl } from "@/utils/api";
import { getClientToken } from "@/utils/clientAuth";

interface ReturnExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productName?: string;
  onSuccess?: () => void;
}

type RequestType = "return" | "exchange" | null;

export default function ReturnExchangeModal({
  isOpen,
  onClose,
  orderId,
  productName,
  onSuccess,
}: ReturnExchangeModalProps) {
  const [requestType, setRequestType] = useState<RequestType>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [replacementProduct, setReplacementProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const returnReasons = [
    "Damaged or Defective",
    "Wrong Item Received",
    "Not As Described",
    "Size/Fit Issue",
    "Color Mismatch",
    "Changed Mind",
    "Quality Issue",
    "Other",
  ];

  const exchangeReasons = [
    "Wrong Size",
    "Wrong Color",
    "Defective",
    "Not As Described",
    "Quality Issue",
    "Other",
  ];

  const reasons = requestType === "exchange" ? exchangeReasons : returnReasons;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!reason) {
      setError("Please select a reason");
      setLoading(false);
      return;
    }

    try {
      const token = getClientToken();
      if (!token) {
        setError("Please login to continue");
        setLoading(false);
        return;
      }

      const endpoint =
        requestType === "exchange" ? "/api/exchanges" : "/api/returns";

      const payload: any = {
        orderId: parseInt(orderId),
        reason,
        description,
      };

      if (requestType === "exchange") {
        payload.replacementProduct = replacementProduct || undefined;
      }

      const res = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Failed to submit ${requestType} request`);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setSuccess(false);
        setReason("");
        setDescription("");
        setReplacementProduct("");
        setRequestType(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#7a1f2b] to-[#5a1420] text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {requestType === "exchange"
              ? "Request Exchange"
              : requestType === "return"
                ? "Request Return"
                : "Return or Exchange"}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-600 mb-2">
                {requestType === "exchange"
                  ? "Exchange Request Submitted!"
                  : "Return Request Submitted!"}
              </h3>
              <p className="text-gray-600 text-sm">
                We've received your {requestType} request. Check your email for details and next steps.
              </p>
            </div>
          ) : !requestType ? (
            // Type Selection Step
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-6">
                What would you like to do?
              </p>

              <button
                onClick={() => setRequestType("return")}
                className="w-full p-4 border-2 border-[#7a1f2b] rounded-2xl hover:bg-[#fdf8f6] transition text-left"
              >
                <p className="font-bold text-[#7a1f2b] text-lg mb-1">↩ Return</p>
                <p className="text-sm text-gray-600">
                  Send back the product and get a refund
                </p>
              </button>

              <button
                onClick={() => setRequestType("exchange")}
                className="w-full p-4 border-2 border-[#4a1a6b] rounded-2xl hover:bg-[#faf7fd] transition text-left"
              >
                <p className="font-bold text-[#4a1a6b] text-lg mb-1">⇄ Exchange</p>
                <p className="text-sm text-gray-600">
                  Replace with a different size or color
                </p>
              </button>
            </div>
          ) : (
            // Form Step
            <form onSubmit={handleSubmit}>
              {/* Product Info */}
              {productName && (
                <div className="mb-6 p-3 bg-[#fdf8f6] rounded-lg border border-[#ead2d8]">
                  <p className="text-xs text-gray-600 mb-1">Product</p>
                  <p className="font-semibold text-gray-900">{productName}</p>
                </div>
              )}

              {/* Reason Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {requestType === "exchange" ? "Exchange" : "Return"} Reason *
                </label>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <label
                      key={r}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-[#fdf8f6] transition"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 text-[#7a1f2b]"
                      />
                      <span className="ml-3 text-gray-900 text-sm">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    requestType === "exchange"
                      ? "Tell us what you need (e.g., damaged corner)..."
                      : "Tell us more about the issue..."
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a1f2b] resize-none"
                  rows={3}
                />
              </div>

              {/* Replacement Product (Exchange Only) */}
              {requestType === "exchange" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    What size/color do you want? (Optional)
                  </label>
                  <input
                    type="text"
                    value={replacementProduct}
                    onChange={(e) => setReplacementProduct(e.target.value)}
                    placeholder="e.g., Size L in Red"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#7a1f2b] text-white rounded-lg font-medium hover:bg-[#8d2742] transition disabled:opacity-50"
                >
                  {loading
                    ? "Submitting..."
                    : requestType === "exchange"
                      ? "Submit Exchange"
                      : "Submit Return"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
