"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import {
  getAllProducts,
  deleteProduct,
  type Product,
} from "@/utils/productApi";

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdminAndLoadProducts = async () => {
      const token = localStorage.getItem("token");
      const isAdmin = localStorage.getItem("isAdmin");

      if (!token || isAdmin !== "true") {
        router.push("/login");
        return;
      }

      try {
        const data = await getAllProducts();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndLoadProducts();
  }, [router]);

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

  return (
    <>
      <AdminNav />

      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#4a2c2a]">
                Product Management
              </h1>
              <p className="mt-2 text-[#5e3339]">
                Edit and remove products from the store catalog.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#7a1f2b]">
                No products available.
              </p>
              <p className="mt-3 text-[#6b7280]">
                Add a new product to display it in the shop.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {products.map((product) => (
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
    </>
  );
}