"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { getProductById, updateProduct } from "@/utils/productApi";

const categories = ["Skincare", "Hair", "Fragrance", "Makeup", "Body"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    brand: "",
    description: "",
    shortDescription: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    category: "Skincare",
    countInStock: "",
    images: "",
    isFeatured: false,
    isPublished: true,
  });

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const token = localStorage.getItem("token");
      const isAdmin = localStorage.getItem("isAdmin");

      if (!token || isAdmin !== "true") {
        router.push("/login");
        return;
      }

      try {
        const data = await getProductById(productId);
        const product = data.product;

        setForm({
          name: product.name || "",
          slug: product.slug || "",
          brand: product.brand || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          price: String(product.price ?? ""),
          originalPrice: String(product.originalPrice ?? ""),
          discountPercent: String(product.discountPercent ?? ""),
          category: product.category || "Skincare",
          countInStock: String(product.countInStock ?? ""),
          images: Array.isArray(product.images) ? product.images.join("\n") : "",
          isFeatured: !!product.isFeatured,
          isPublished: !!product.isPublished,
        });
      } catch (error) {
        console.error("Load product error:", error);
        alert("Failed to load product.");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      verifyAndLoad();
    }
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      router.push("/login");
      return;
    }

    const requiredFields = [
      "name",
      "description",
      "price",
      "category",
      "countInStock",
    ];

    for (const field of requiredFields) {
      if (!form[field as keyof typeof form]) {
        alert("Please fill all required fields.");
        return;
      }
    }

    const parsedImages = form.images
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (parsedImages.length === 0) {
      alert("Please add at least one image URL.");
      return;
    }

    try {
      setSubmitting(true);

      await updateProduct(
        productId,
        {
          name: form.name.trim(),
          slug: form.slug.trim()
            ? generateSlug(form.slug)
            : generateSlug(form.name),
          brand: form.brand.trim(),
          description: form.description.trim(),
          shortDescription: form.shortDescription.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          originalPrice: form.originalPrice
            ? Number(form.originalPrice)
            : undefined,
          discountPercent: form.discountPercent
            ? Number(form.discountPercent)
            : 0,
          countInStock: Number(form.countInStock),
          images: parsedImages,
          isFeatured: form.isFeatured,
          isPublished: form.isPublished,
        },
        token
      );

      alert("Product updated successfully.");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Update product error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to update product. Please try again.";

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#ead2d8] bg-white p-8 shadow-sm">
            <p className="text-[#7a1f2b] text-lg font-semibold">
              Loading product...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#ead2d8] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4a2c2a]">Edit Product</h1>
            <p className="mt-2 text-[#5e3339]">
              Update product details and save changes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Product Name *
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Slug *
                </span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Brand
                </span>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Category *
                </span>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#4a2c2a]">
                Description *
              </span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#4a2c2a]">
                Short Description
              </span>
              <textarea
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                rows={2}
                className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
              />
            </label>

            <div className="grid gap-6 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Price *
                </span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Original Price
                </span>
                <input
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) =>
                    setForm({ ...form, originalPrice: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Discount %
                </span>
                <input
                  type="number"
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm({ ...form, discountPercent: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#4a2c2a]">
                  Stock *
                </span>
                <input
                  type="number"
                  value={form.countInStock}
                  onChange={(e) =>
                    setForm({ ...form, countInStock: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
                />
              </label>

              <div className="flex flex-col justify-end gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#7a1f2b] text-[#7a1f2b] focus:ring-[#7a1f2b]"
                  />
                  <span className="text-sm text-[#4a2c2a]">
                    Featured Product
                  </span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) =>
                      setForm({ ...form, isPublished: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#7a1f2b] text-[#7a1f2b] focus:ring-[#7a1f2b]"
                  />
                  <span className="text-sm text-[#4a2c2a]">Published</span>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#4a2c2a]">
                Images (one URL/path per line) *
              </span>
              <textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
              />
            </label>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#7a1f2b] px-8 py-3 text-white font-semibold hover:bg-[#8f2e47] transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Updating..." : "Update Product"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="rounded-full border border-[#7a1f2b] px-8 py-3 text-[#7a1f2b] font-semibold hover:bg-[#f7e7ea] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}