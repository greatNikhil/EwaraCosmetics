"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
  type Product,
} from "@/utils/productApi";

export interface AdminProductsPageProps {
  externalSearchTerm?: string;
  inventoryMode?: boolean;
}

export function AdminProductsView({
  externalSearchTerm = "",
  inventoryMode = false,
}: AdminProductsPageProps) {
  const router = useRouter();
  const { token, isAuthorized, isChecking } = useProtectedRoute({ requireAdmin: true });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [inventoryFeedback, setInventoryFeedback] = useState<string | null>(null);

  const filteredProducts = products.filter((product) =>
    [
      product.name,
      product.category,
      product.description,
      product.slug,
      String(product.price),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(externalSearchTerm.toLowerCase().trim())
  );

  const inventoryProducts = [...filteredProducts].sort((a, b) => {
    const aPriority = a.countInStock <= 0 ? 0 : a.countInStock <= 5 ? 1 : 2;
    const bPriority = b.countInStock <= 0 ? 0 : b.countInStock <= 5 ? 1 : 2;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.countInStock - b.countInStock || a.name.localeCompare(b.name);
  });

  useEffect(() => {
    const loadProducts = async () => {
      if (!token || !isAuthorized) {
        if (!isChecking) {
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getAllProducts();
        setProducts(data.products);
        setStockDrafts(
          Object.fromEntries(
            data.products.map((product) => [product._id, String(product.countInStock ?? 0)])
          )
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isAuthorized, isChecking, token]);

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
      router.push("/login");
      return;
    }

    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      await deleteProduct(id, token);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Failed to delete product.");
    }
  };

  const handleInventorySave = async (product: Product) => {
    if (!token) {
      alert("Please login again.");
      router.push("/login");
      return;
    }

    const nextCountInStock = Number(stockDrafts[product._id]);

    if (!Number.isFinite(nextCountInStock) || nextCountInStock < 0) {
      alert("Stock quantity must be 0 or greater.");
      return;
    }

    try {
      setSavingStockId(product._id);
      setInventoryFeedback(null);

      await updateProduct(
        product._id,
        { countInStock: nextCountInStock },
        token
      );

      setProducts((prev) =>
        prev.map((currentProduct) =>
          currentProduct._id === product._id
            ? { ...currentProduct, countInStock: nextCountInStock }
            : currentProduct
        )
      );
      setInventoryFeedback(`${product.name} stock updated to ${nextCountInStock}.`);
    } catch (error) {
      console.error("Update stock error:", error);
      alert("Failed to update inventory.");
    } finally {
      setSavingStockId(null);
    }
  };

  const getInventoryStatus = (countInStock: number) => {
    if (countInStock <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (countInStock <= 5) {
      return {
        label: "Low Stock",
        className: "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-100 text-green-700",
    };
  };

  return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#4a2c2a]">
                Product Management
              </h1>
              <p className="mt-2 text-[#5e3339]">
                {inventoryMode
                  ? "Update stock counts quickly and keep low inventory under control."
                  : "Edit and remove products from the store catalog."}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3 py-2">
              <Link
                href="/admin/products/add"
                className="rounded-full bg-[#7a1f2b] px-6 py-3 font-semibold text-white shadow-lg shadow-[#7a1f2b]/20 transition hover:bg-[#8d2742]"
              >
                Add Product
              </Link>

              <Link
                href="/admin"
                className="rounded-full border border-[#7a1f2b] px-6 py-3 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#7a1f2b]">
                Loading products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#7a1f2b]">
                {externalSearchTerm.trim() ? "No products match your search." : "No products available."}
              </p>
              <p className="mt-3 text-[#6b7280]">
                {externalSearchTerm.trim()
                  ? "Try a different product name, category, or keyword."
                  : "Add a new product to display it in the shop."}
              </p>
            </div>
          ) : inventoryMode ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                    Total Products
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#3e2f2b]">
                    {inventoryProducts.length}
                  </p>
                </div>
                <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                    Low Stock
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#3e2f2b]">
                    {inventoryProducts.filter((product) => product.countInStock > 0 && product.countInStock <= 5).length}
                  </p>
                </div>
                <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                    Out of Stock
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#3e2f2b]">
                    {inventoryProducts.filter((product) => product.countInStock <= 0).length}
                  </p>
                </div>
              </div>

              {inventoryFeedback && (
                <div className="rounded-2xl border border-[#cfe6bd] bg-[#f3faeb] px-4 py-3 text-sm text-[#3b6d11] shadow-sm">
                  {inventoryFeedback}
                </div>
              )}

              <div className="space-y-4">
                {inventoryProducts.map((product) => {
                  const inventoryStatus = getInventoryStatus(product.countInStock);

                  return (
                    <div
                      key={product._id}
                      className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="h-24 w-24 overflow-hidden rounded-3xl bg-[#f7e9e7]">
                            <img
                              src={product.images?.[0] || "/favicon/product.jpeg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#7a1f2b]/70">
                              {product.category}
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-[#4a2c2a]">
                              {product.name}
                            </h2>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${inventoryStatus.className}`}>
                                {inventoryStatus.label}
                              </span>
                              <span className="rounded-full bg-[#f7e7ea] px-3 py-1 text-xs font-medium text-[#7a1f2b]">
                                Current Stock: {product.countInStock}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  product.isPublished
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {product.isPublished ? "Published" : "Hidden"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full max-w-md rounded-3xl border border-[#f1e5df] bg-[#fffaf7] p-4">
                          <p className="text-sm font-semibold text-[#4a2c2a]">
                            Update Inventory
                          </p>
                          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                              type="number"
                              min="0"
                              value={stockDrafts[product._id] ?? String(product.countInStock)}
                              onChange={(event) =>
                                setStockDrafts((prev) => ({
                                  ...prev,
                                  [product._id]: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-[#ead2d8] bg-white px-4 py-3 text-[#3e2f2b] outline-none focus:border-[#7a1f2b]"
                            />
                            <button
                              type="button"
                              onClick={() => handleInventorySave(product)}
                              disabled={savingStockId === product._id}
                              className="rounded-full bg-[#7a1f2b] px-5 py-3 font-semibold text-white transition hover:bg-[#8d2742] disabled:opacity-50"
                            >
                              {savingStockId === product._id ? "Saving..." : "Save Stock"}
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                              className="rounded-full border border-[#7a1f2b] px-5 py-3 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
                            >
                              Full Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm transition hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="h-32 w-32 overflow-hidden rounded-3xl bg-[#f7e9e7]">
                      <img
                        src={product.images?.[0] || "/favicon/product.jpeg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm uppercase tracking-[0.3em] text-[#7a1f2b]/70">
                        {product.category}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold text-[#4a2c2a]">
                        {product.name}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm text-[#6b7280]">
                        {product.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <p className="text-lg font-bold text-[#7a1f2b]">
                          ₹{product.price}
                        </p>

                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <p className="text-sm text-gray-400 line-through">
                              ₹{product.originalPrice}
                            </p>
                          )}

                        {product.discountPercent &&
                          product.discountPercent > 0 && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              {product.discountPercent}% OFF
                            </span>
                          )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.isFeatured
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.isFeatured ? "Featured" : "Not Featured"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.isPublished ? "Published" : "Hidden"}
                        </span>

                        <span className="rounded-full bg-[#f7e7ea] px-3 py-1 text-xs font-medium text-[#7a1f2b]">
                          Stock: {product.countInStock}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        router.push(`/admin/products/edit/${product._id}`)
                      }
                      className="rounded-full border border-[#7a1f2b] px-5 py-2 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="rounded-full bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

export default function AdminProductsPage() {
  return <AdminProductsView />;
}
