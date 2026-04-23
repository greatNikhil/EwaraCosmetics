"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/utils/cart";
import { toggleWishlist, isInWishlist } from "@/utils/wishlist";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  countInStock: number;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const safeImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["/favicon/product.jpeg"];

  const [currentImage, setCurrentImage] = useState(safeImages[0]);
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCurrentImage(safeImages[0]);

    // Optional: keep wishlist state synced if your util supports backend-shaped objects
    try {
      setIsLiked(isInWishlist(product as any));
    } catch {
      setIsLiked(false);
    }
  }, [product._id, product.images]);

  const toggleWishlistHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowLiked = toggleWishlist(product as any);
    setIsLiked(isNowLiked);
  };

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product as any);
    alert("Added to bag!");
  };

  const handleTitleClick = () => {
    router.push(`/product/${product._id}`);
  };

  const discount =
    product.discountPercent ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0);

  const isNewProduct = (() => {
    const createdDate = new Date(product.createdAt).getTime();
    const now = Date.now();
    const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  })();

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {/* NEW IN Badge */}
      {isNewProduct && (
        <div className="absolute top-3 left-3 bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
          NEW IN
        </div>
      )}

      {/* Wishlist Heart */}
      <button
        onClick={toggleWishlistHandler}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition"
      >
        <Heart
          className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
          onMouseEnter={() => {
            setCurrentImage(safeImages[1] || safeImages[0]);
          }}
          onMouseLeave={() => {
            setCurrentImage(safeImages[0]);
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3
          onClick={handleTitleClick}
          className="text-sm font-medium text-[#4a2c2a] mb-1 cursor-pointer hover:text-[#7a1f2b] transition"
        >
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 mb-2">
          {product.brand || product.category}
        </p>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-lg font-semibold text-[#7a1f2b]">
            ₹{product.price}
          </span>

          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}

          {discount > 0 && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Shade Dots - decorative for now */}
        <div className="flex gap-1 mb-3">
          <div className="w-4 h-4 bg-pink-200 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-200 rounded-full"></div>
          <div className="w-4 h-4 bg-brown-200 rounded-full"></div>
        </div>

        {/* Add to Bag Button */}
        <button
          onClick={handleAddToBag}
          className="w-full py-2 bg-white border border-[#ead2d8] text-[#7a1f2b] rounded-full hover:bg-[#7a1f2b] hover:text-white transition-all duration-300"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}