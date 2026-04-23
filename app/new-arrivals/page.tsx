"use client";

import ProductCard from "@/components/ProductCard";
import { getAllProducts, type Product } from "@/utils/productApi";
import { useEffect, useState } from "react";

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
        
        // Handle both response formats
        const productsList = Array.isArray(data) ? data : (data.products || []);
        
        // Filter for published products only
        const publishedProducts = productsList.filter(
          (product: Product) => product.isPublished === true
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

  return (
    <div className="min-h-screen bg-[#fdf8f6] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4a2c2a] text-center mb-8">
          New Arrivals
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#6b7280] text-lg">Loading new arrivals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg font-semibold">Error</p>
            <p className="text-[#6b7280] text-sm mt-2">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6b7280] text-lg">
              No new arrivals available yet.
            </p>
            <p className="text-[#6b7280] text-sm mt-2">
              Check back soon for the latest products!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
