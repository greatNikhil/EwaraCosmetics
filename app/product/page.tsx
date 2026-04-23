"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProductById, type Product } from "@/utils/productApi";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(productId);
        setProduct(data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#6b7280]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4a2c2a] mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600">
            {error || "The product you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.images?.[0] || "/favicon/product.jpeg"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#4a2c2a] mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {product.brand || "Ewara"}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-[#4a2c2a]">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
              <button className="w-full bg-[#4a2c2a] text-white py-3 px-6 rounded-lg hover:bg-[#3a2220] transition-colors mb-4">
                Add to Cart
              </button>
              <button className="w-full border border-[#4a2c2a] text-[#4a2c2a] py-3 px-6 rounded-lg hover:bg-[#4a2c2a] hover:text-white transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
