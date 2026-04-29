"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/utils/api";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount?: number;
  isActive: boolean;
  expiresAt?: string;
}

const initialForm = {
  code: "",
  type: "percent" as "percent" | "flat",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

export interface AdminCouponsPageProps {
  externalSearchTerm?: string;
  inventoryMode?: boolean;
}

export function AdminCouponsView({
  externalSearchTerm = "",
}: AdminCouponsPageProps) {
  const router = useRouter();
  const { token, isAuthorized, isChecking } = useProtectedRoute({ requireAdmin: true });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const filteredCoupons = coupons.filter((coupon) =>
    [
      coupon.code,
      coupon.type,
      coupon.isActive ? "active" : "inactive",
      String(coupon.value),
      String(coupon.minOrderAmount),
      String(coupon.usedCount ?? ""),
      String(coupon.maxUses ?? ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(externalSearchTerm.toLowerCase().trim())
  );

  const loadCoupons = async () => {
    if (!token || !isAuthorized) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/coupons"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to load coupons");
        return;
      }

      setCoupons(data.coupons || []);
    } catch (error) {
      console.error("LOAD COUPONS ERROR:", error);
      alert("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !isAuthorized) {
      if (!isChecking) {
        setLoading(false);
      }
      return;
    }

    loadCoupons();
  }, [isAuthorized, isChecking, token]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f6]">
        <p className="text-[#7a1f2b]">Checking admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      };

      const res = await fetch(
        editingId
          ? buildApiUrl(`/api/coupons/${editingId}`)
          : buildApiUrl("/api/coupons"),
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save coupon");
        return;
      }

      await loadCoupons();
      resetForm();
      alert(editingId ? "Coupon updated successfully." : "Coupon created successfully.");
    } catch (error) {
      console.error("SAVE COUPON ERROR:", error);
      alert("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: String(coupon.minOrderAmount || 0),
      maxUses: String(coupon.maxUses || ""),
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
        : "",
      isActive: coupon.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      alert("Please login again.");
      return;
    }

    if (!window.confirm("Delete this coupon?")) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl(`/api/coupons/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete coupon");
        return;
      }

      setCoupons((prev) => prev.filter((coupon) => coupon._id !== id));
      if (editingId === id) {
        resetForm();
      }
      alert("Coupon deleted successfully.");
    } catch (error) {
      console.error("DELETE COUPON ERROR:", error);
      alert("Failed to delete coupon");
    }
  };

  return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4a2c2a]">
              Coupon Management
            </h1>
            <p className="mt-2 text-[#5e3339]">
              Create, edit, activate, and remove discount coupons.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#4a2c2a]">
                  {editingId ? "Edit Coupon" : "Create Coupon"}
                </h2>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm font-medium text-[#7a1f2b]"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                  required
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        type: e.target.value as "percent" | "flat",
                      }))
                    }
                    className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                  >
                    <option value="percent">Percent</option>
                    <option value="flat">Flat</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    placeholder="Value"
                    value={form.value}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, value: e.target.value }))
                    }
                    className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Minimum order amount"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        minOrderAmount: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                  />

                  <input
                    type="number"
                    min="1"
                    placeholder="Max uses"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        maxUses: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                    }
                    className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 text-[#4a2c2a]">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                  Active coupon
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#7a1f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#8d2742] disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>

            <div className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-semibold text-[#4a2c2a]">
                Existing Coupons
              </h2>

              {loading ? (
                <p className="text-[#7a1f2b]">Loading coupons...</p>
              ) : filteredCoupons.length === 0 ? (
                <p className="text-[#6b7280]">
                  {externalSearchTerm.trim() ? "No coupons match your search." : "No coupons created yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="rounded-2xl border border-[#f1e5df] bg-[#fffaf7] p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[#3e2f2b]">
                            {coupon.code}
                          </p>
                          <p className="mt-1 text-sm text-[#6b7280]">
                            {coupon.type === "percent"
                              ? `${coupon.value}% off`
                              : `Rs. ${coupon.value} off`}
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            Minimum order: Rs. {coupon.minOrderAmount || 0}
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            Usage: {coupon.usedCount || 0}
                            {coupon.maxUses ? ` / ${coupon.maxUses}` : " / Unlimited"}
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            Expires:{" "}
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString("en-IN")
                              : "No expiry"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              coupon.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>

                          <button
                            onClick={() => startEdit(coupon)}
                            className="rounded-full border border-[#7a1f2b] px-4 py-2 text-sm font-semibold text-[#7a1f2b] hover:bg-[#f7e7ea]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default function AdminCouponsPage() {
  return <AdminCouponsView />;
}
