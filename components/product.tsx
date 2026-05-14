"use client";

import ProductCard from "@/components/ProductCard";
import { useRouter } from "next/navigation";
import { useFadeIn } from "@/hooks/useFadeIn";
import { getAllProducts, Product } from "@/utils/productApi";
import { useEffect, useState } from "react";

export default function Products() {
  const { ref, visible } = useFadeIn();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section
      ref={ref}
      className={`${visible ? "fade-show" : "fade-hidden"} section-space`}
    >
      <div className="section-shell mb-8 flex items-end justify-between gap-6 px-1">
        <div className="space-y-3">
          <span className="section-kicker">Most loved</span>
          <h2 className="section-heading">Best Sellers</h2>
        </div>

        <button
          onClick={() => router.push("/shop")}
          className="text-sm font-semibold text-[var(--brand-primary)] transition hover:opacity-75"
        >
          View All &rarr;
        </button>
      </div>

      {loading ? (
        <div className="section-shell px-1 py-8 text-center">
          <p className="text-lg text-[var(--text-secondary)]">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="section-shell px-1 py-8 text-center">
          <p className="text-lg text-[var(--text-secondary)]">No products available yet.</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Check back soon for our collection.
          </p>
        </div>
      ) : (
        <div className="section-shell grid grid-cols-2 gap-5 px-1 md:grid-cols-4 md:gap-7">
          {products.map((product, i) => (
            <div
              key={product._id}
              style={{ animationDelay: `${i * 0.1}s` }}
              className="fade-hidden animate-fadeUp"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
