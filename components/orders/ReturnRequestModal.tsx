"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { buildApiUrl } from "@/utils/api";
import { getClientToken } from "@/utils/clientAuth";

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productId?: string;
  productName?: string;
  onSuccess?: () => void;
}

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
  onSuccess,
}: ReturnRequestModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reasons = [
    "Damaged or Defective",
    "Wrong Item Received",
    "Not As Described",
    "Size/Fit Issue",
    "Color Mismatch",
    "Changed Mind",
    "Quality Issue",
    "Other",
  ];

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

      const payload = {
        orderId: parseInt(orderId),
        productId: productId ? parseInt(productId) : undefined,
        reason,
        description,
      };

      const res = await fetch(buildApiUrl("/api/returns"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit return request");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setSuccess(false);
        setReason("");
        setDescription("");
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
          <h2 className="text-xl font-bold">Request Return</h2>
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
                Return Request Submitted!
              </h3>
              <p className="text-gray-600 text-sm">
                We've received your return request. Check your email for details and next steps.
              </p>
            </div>
          ) : (
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
                  Return Reason *
                </label>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <label key={r} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-[#fdf8f6] transition">
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
                  placeholder="Tell us more about the issue..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a1f2b] resize-none"
                  rows={4}
                />
              </div>

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
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#7a1f2b] text-white rounded-lg font-medium hover:bg-[#8d2742] transition disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Return Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
