"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildApiUrl } from "@/utils/api";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

interface Offer {
  _id: string;
  text: string;
  isActive: boolean;
  displayOrder: number;
}

interface AdminOffersPageProps {
  externalSearchTerm?: string;
  inventoryMode?: boolean;
}

const initialForm = {
  text: "",
  isActive: true,
  displayOrder: "0",
};

function OfferModal({
  open,
  title,
  form,
  saving,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  form: typeof initialForm;
  saving: boolean;
  error: string;
  onChange: (next: typeof initialForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1320]/35 px-4">
      <div className="w-full max-w-2xl rounded-[12px] border border-[#f0e4e8] border-[0.5px] bg-white p-6 shadow-[0_24px_50px_rgba(59,24,39,0.14)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-[#3a1a22]">{title}</h2>
            <p className="mt-1 text-[13px] text-[#8a6f79]">
              Control marquee text, visibility, and display priority.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] border border-[#f0e4e8] px-3 py-2 text-[12px] text-[#7b1d3a] hover:bg-[#fdf0f3]"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#4a1a6b]">
              Offer Text
            </label>
            <textarea
              value={form.text}
              onChange={(event) => onChange({ ...form, text: event.target.value })}
              placeholder="e.g. Get 50% Off on orders above Rs.999"
              rows={4}
              className="w-full rounded-[10px] border border-[#f0e4e8] bg-[#fffafc] px-4 py-3 text-[14px] text-[#3a1a22] outline-none transition focus:border-[#7b1d3a]"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4a1a6b]">
                Status
              </label>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(event) =>
                  onChange({
                    ...form,
                    isActive: event.target.value === "active",
                  })
                }
                className="w-full rounded-[10px] border border-[#f0e4e8] bg-[#fffafc] px-4 py-3 text-[14px] text-[#3a1a22] outline-none transition focus:border-[#7b1d3a]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4a1a6b]">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(event) =>
                  onChange({ ...form, displayOrder: event.target.value })
                }
                className="w-full rounded-[10px] border border-[#f0e4e8] bg-[#fffafc] px-4 py-3 text-[14px] text-[#3a1a22] outline-none transition focus:border-[#7b1d3a]"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-[10px] border border-[#f3c5c5] bg-[#fff5f5] px-4 py-3 text-[13px] text-[#a32d2d]">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] border border-[#7b1d3a] px-5 py-2.5 text-[13px] font-medium text-[#7b1d3a] hover:bg-[#fdf0f3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-[8px] bg-[#7b1d3a] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#651730] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminOffersPage({
  externalSearchTerm = "",
}: AdminOffersPageProps) {
  const { token, isAuthorized, isChecking } = useProtectedRoute({ requireAdmin: true });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const loadOffers = async () => {
    if (!token || !isAuthorized) return;

    try {
      const res = await fetch(buildApiUrl("/api/offers/admin"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load offers");
      }

      setOffers(data.offers || []);
      setError("");
    } catch (loadError: any) {
      setError(loadError.message || "Failed to load offers");
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

    loadOffers();
  }, [isAuthorized, isChecking, token]);

  const filteredOffers = useMemo(() => {
    const normalizedSearch = externalSearchTerm.toLowerCase().trim();

    return offers.filter((offer) => {
      if (!normalizedSearch) return true;

      return [offer.text, offer.isActive ? "active" : "inactive", String(offer.displayOrder)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [externalSearchTerm, offers]);

  const resetModalState = () => {
    setEditingOfferId(null);
    setForm(initialForm);
    setError("");
    setModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingOfferId(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOfferId(offer._id);
    setForm({
      text: offer.text,
      isActive: offer.isActive,
      displayOrder: String(offer.displayOrder ?? 0),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        text: form.text.trim(),
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder || 0),
      };

      const res = await fetch(
        editingOfferId
          ? buildApiUrl(`/api/offers/${editingOfferId}`)
          : buildApiUrl("/api/offers"),
        {
          method: editingOfferId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save offer");
      }

      await loadOffers();
      resetModalState();
    } catch (submitError: any) {
      setError(submitError.message || "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    if (!token) {
      alert("Please login again.");
      return;
    }

    try {
      setTogglingId(offer._id);

      const res = await fetch(buildApiUrl(`/api/offers/${offer._id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: offer.text,
          isActive: !offer.isActive,
          displayOrder: offer.displayOrder,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update offer status");
      }

      setOffers((prev) =>
        prev.map((item) =>
          item._id === offer._id
            ? { ...item, isActive: !item.isActive }
            : item
        )
      );
    } catch (toggleError: any) {
      alert(toggleError.message || "Failed to update offer status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (offer: Offer) => {
    if (!token) {
      alert("Please login again.");
      return;
    }

    if (!window.confirm("Delete this offer?")) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl(`/api/offers/${offer._id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete offer");
      }

      setOffers((prev) => prev.filter((item) => item._id !== offer._id));
    } catch (deleteError: any) {
      alert(deleteError.message || "Failed to delete offer");
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf5f7]">
        <p className="text-[#7b1d3a]">Checking admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const totalOffers = offers.length;
  const activeOffers = offers.filter((offer) => offer.isActive).length;
  const inactiveOffers = totalOffers - activeOffers;
  const statCards = [
    { label: "Total Offers", value: totalOffers },
    { label: "Active Offers", value: activeOffers },
    { label: "Inactive Offers", value: inactiveOffers },
  ];

  return (
    <div className="min-h-screen bg-[#fdf5f7] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#4a2c2a]">Offers Management</h1>
            <p className="mt-2 text-[#5e3339]">
              Create and manage promotional banners shown in the top marquee
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-[8px] bg-[#7b1d3a] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#64172f]"
          >
            + Add New Offer
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[12px] border border-[#f0e4e8] border-[0.5px] bg-white p-5"
            >
              <p className="text-[12px] uppercase tracking-[0.14em] text-[#b8949e]">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#3a1a22]">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[12px] border border-[#f0e4e8] border-[0.5px] bg-white p-5">
          {loading ? (
            <p className="text-[#7b1d3a]">Loading offers...</p>
          ) : filteredOffers.length === 0 ? (
            <p className="text-[#7a5060]">
              {externalSearchTerm.trim()
                ? "No offers match your search."
                : "No offers created yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="rounded-[12px] border border-[#f0e4e8] border-[0.5px] bg-[#fffafb] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <p className="text-[15px] font-medium leading-7 text-[#3a1a22]">
                        {offer.text}
                      </p>
                      <p className="mt-2 text-[12px] text-[#a38790]">
                        Display order: {offer.displayOrder}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(offer)}
                        disabled={togglingId === offer._id}
                        className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                          offer.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        } disabled:opacity-60`}
                      >
                        {togglingId === offer._id
                          ? "Updating..."
                          : offer.isActive
                            ? "Active"
                            : "Inactive"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(offer)}
                        className="rounded-[8px] border border-[#7b1d3a] px-4 py-2 text-[13px] font-medium text-[#7b1d3a] hover:bg-[#fdf0f3]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(offer)}
                        className="rounded-[8px] border border-[#d13b4d] px-4 py-2 text-[13px] font-medium text-[#d13b4d] hover:bg-[#fff1f3]"
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

      <OfferModal
        open={modalOpen}
        title={editingOfferId ? "Edit Offer" : "Add New Offer"}
        form={form}
        saving={saving}
        error={error}
        onChange={setForm}
        onClose={resetModalState}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
