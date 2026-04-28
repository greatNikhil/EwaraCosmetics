"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/utils/api";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

interface ReviewRecord {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  product?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
}

interface AdminReviewsPageProps {
  externalSearchTerm?: string;
  inventoryMode?: boolean;
}

export default function AdminReviewsPage({
  externalSearchTerm = "",
}: AdminReviewsPageProps) {
  const router = useRouter();
  const { token, isAuthorized, isChecking } = useProtectedRoute({ requireAdmin: true });
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const loadReviews = async () => {
    if (!token || !isAuthorized) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/admin/reviews"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to load reviews");
        return;
      }

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("LOAD REVIEWS ERROR:", error);
      alert("Failed to load reviews");
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

    loadReviews();
  }, [isAuthorized, isChecking, token]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const combinedText = [
        review.name,
        review.comment,
        review.product?.name,
        review.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = combinedText.includes(searchTerm.toLowerCase());
      const matchesRating =
        ratingFilter === "All" || review.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [ratingFilter, reviews, searchTerm]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f6]">
        <p className="text-[#7a1f2b]">Checking admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    if (!window.confirm("Delete this review?")) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl(`/api/admin/reviews/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete review");
        return;
      }

      setReviews((prev) => prev.filter((review) => review._id !== id));
      alert("Review deleted successfully.");
    } catch (error) {
      console.error("DELETE REVIEW ERROR:", error);
      alert("Failed to delete review");
    }
  };

  return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4a2c2a]">
              Review Moderation
            </h1>
            <p className="mt-2 text-[#5e3339]">
              Inspect customer reviews and remove anything that should not be shown.
            </p>
          </div>

          <div className="mb-6 grid gap-4 rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm md:grid-cols-[1.5fr_0.5fr]">
            <input
              type="text"
              placeholder="Search by review, product, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
            />

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>

          <div className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm">
            {loading ? (
              <p className="text-[#7a1f2b]">Loading reviews...</p>
            ) : filteredReviews.length === 0 ? (
              <p className="text-[#6b7280]">No reviews found.</p>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-2xl border border-[#f1e5df] bg-[#fffaf7] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-[#3e2f2b]">
                          {review.name}
                        </p>
                        <p className="text-sm text-[#6b7280]">
                          Product: {review.product?.name || "Unknown product"}
                        </p>
                        <p className="text-sm text-[#6b7280]">
                          User: {review.user?.email || "Unknown user"}
                        </p>
                        <p className="text-sm text-[#7a1f2b]">
                          Rating: {review.rating} / 5
                        </p>
                        <p className="leading-7 text-[#5e3339]">{review.comment}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                          {new Date(review.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(review._id)}
                        className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
