"use client";

import ProductCard from "@/components/ProductCard";
import { getAllProducts, type Product } from "@/utils/productApi";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProducts();

        const productsList = Array.isArray(data) ? data : data.products || [];
        const publishedProducts = productsList.filter(
          (product: Product) =>
            product.isPublished === true && product.showInNewArrivals === true
        );

        setProducts(publishedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProduct = useMemo(() => products[0] || null, [products]);
  const secondaryProducts = useMemo(() => products.slice(1, 3), [products]);

  return (
    <div className="min-h-screen bg-[#fcf8f4]">
      <section className="relative h-[48vh] min-h-[360px] overflow-hidden">
        <img
          src="/hero/e1.jpeg"
          alt="New products"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

        <div className="absolute bottom-0 left-0 z-10 w-full px-5 pb-8 pt-20 sm:px-8 md:px-12 md:pb-12">
          <div className="max-w-xl text-white">
            <h1 className="mt-4 text-4xl font-normal leading-tight tracking-[-0.03em] sm:text-5xl md:text-6xl">
              New Arrivals
            </h1>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full border border-white/50 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#2f211d]"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#2f211d] md:text-4xl">
              Latest Products
            </h2>
          </div>

          {loading ? (
            <div className="rounded-[18px] border border-[#e7ddd6] bg-white px-6 py-16 text-center">
              <p className="text-base text-[#7d6d62]">Loading products...</p>
            </div>
          ) : error ? (
            <div className="rounded-[18px] border border-[#efd9d6] bg-[#fff7f6] px-6 py-16 text-center">
              <p className="text-lg font-medium text-[#7a352e]">Error</p>
              <p className="mt-2 text-sm text-[#9f5c57]">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[18px] border border-[#e7ddd6] bg-white px-6 py-16 text-center">
              <p className="text-lg font-medium text-[#2f211d]">
                No new arrival products available.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.82fr]">
              <div className="min-h-[560px]">
                {featuredProduct && (
                  <ProductCard product={featuredProduct} variant="arrival-featured" />
                )}
              </div>

              <div className="flex min-h-[560px] flex-col gap-5">
                {secondaryProducts.map((product) => (
                  <div key={product._id} className="flex-1">
                    <ProductCard product={product} variant="arrival-compact" />
                  </div>
                ))}

                {secondaryProducts.length < 2 && (
                  <div className="flex flex-1 items-center justify-center rounded-[14px] border border-dashed border-[#e7ddd6] bg-white px-6 py-10 text-center text-sm text-[#7d6d62]">
                    More products will appear here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
