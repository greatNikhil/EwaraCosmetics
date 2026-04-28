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
      className={`${visible ? "fade-show" : "fade-hidden"} py-12`}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto px-6 mb-6">
        <h2 className="text-xl font-semibold">Best Sellers</h2>

        <button
          onClick={() => router.push("/shop")}
          className="text-sm text-[#7a1f2b] hover:underline"
        >
          View All →
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 max-w-6xl mx-auto px-6">
          <p className="text-[#6b7280] text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 max-w-6xl mx-auto px-6">
          <p className="text-[#6b7280] text-lg">No products available yet.</p>
          <p className="text-[#6b7280] text-sm mt-2">
            Check back soon for our collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
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
