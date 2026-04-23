"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById, type Product } from "@/utils/productApi";
import { addToCart } from "@/utils/cart";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data.product);

        if (data.product.images?.length > 0) {
          setCurrentImage(data.product.images[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToBag = () => {
    if (!product) return;
    addToCart(product as any);
    alert("Added to bag!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#7a1f2b]">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-semibold text-[#7a1f2b]">
            Product not found.
          </p>
        </div>
      </div>
    );
  }

  const discount =
    product.discountPercent ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0);

  return (
    <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        {/* Left: Images */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-[#ead2d8] bg-[#fdf8f6]">
            <img
              src={currentImage || "/favicon/product.jpeg"}
              alt={product.name}
              className="h-[420px] w-full object-cover"
            />
          </div>

          {product.images?.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(img)}
                  className={`overflow-hidden rounded-2xl border ${
                    currentImage === img
                      ? "border-[#7a1f2b]"
                      : "border-[#ead2d8]"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.25em] text-[#7a1f2b]/70">
            {product.category}
          </p>

          <h1 className="mt-3 text-4xl font-bold text-[#4a2c2a]">
            {product.name}
          </h1>

          <p className="mt-2 text-sm text-[#6b7280]">
            {product.brand || "Ewara Cosmetics"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-[#7a1f2b]">
              ₹{product.price}
            </p>

            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-lg text-gray-400 line-through">
                ₹{product.originalPrice}
              </p>
            )}

            {discount > 0 && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-[#4a2c2a]">Description</p>
            <p className="mt-2 leading-7 text-[#5e3339]">
              {product.description}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#f7e7ea] px-4 py-2 text-sm font-medium text-[#7a1f2b]">
              Stock: {product.countInStock}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                product.isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.isPublished ? "Available" : "Hidden"}
            </span>
          </div>

          <button
            onClick={handleAddToBag}
            className="mt-8 w-full rounded-full bg-[#7a1f2b] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#8f2e47]"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}