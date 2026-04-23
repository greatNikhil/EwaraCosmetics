"use client";

import { useState, useEffect } from "react";
import { Heart, Zap } from "lucide-react";
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
  const [isHovering, setIsHovering] = useState(false);
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
    <div 
      className="group relative bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden cursor-pointer border border-[#f0e6e3]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* NEW IN Badge */}
      {isNewProduct && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-md flex items-center gap-1">
          <Zap className="w-3 h-3" />
          NEW IN
        </div>
      )}

      {/* Wishlist Heart */}
      <button
        onClick={toggleWishlistHandler}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
      >
        <Heart
          className={`w-5 h-5 transition-colors duration-300 ${
            isLiked 
              ? "fill-[#7a1f2b] text-[#7a1f2b]" 
              : "text-[#b5a9a4] hover:text-[#7a1f2b]"
          }`}
        />
      </button>

      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#fdf8f6]">
        <img
          src={currentImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovering ? "scale-110" : "scale-100"
          }`}
          onMouseEnter={() => {
            setCurrentImage(safeImages[1] || safeImages[0]);
          }}
          onMouseLeave={() => {
            setCurrentImage(safeImages[0]);
          }}
        />

        {/* In Stock Indicator */}
        {product.countInStock > 0 && (
          <div className="absolute bottom-3 left-3 bg-green-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            In Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Brand / Category */}
        <p className="text-xs font-semibold text-[#9c8b87] uppercase tracking-wide">
          {product.brand || product.category}
        </p>

        {/* Product Name */}
        <h3
          onClick={handleTitleClick}
          className="text-sm font-semibold text-[#4a2c2a] line-clamp-2 cursor-pointer hover:text-[#7a1f2b] transition-colors duration-200 leading-tight"
        >
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-bold text-[#7a1f2b]">
            ₹{product.price}
          </span>

          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-[#b5a9a4] line-through font-medium">
                ₹{product.originalPrice}
              </span>
              {discount > 0 && (
                <span className="text-xs font-bold text-white bg-[#7a1f2b] px-2.5 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Shade Dots - decorative */}
        <div className="flex gap-1.5 pt-1">
          <div className="w-3 h-3 bg-[#f7e7ea] rounded-full border border-[#ead2d8] hover:scale-125 transition-transform duration-200" title="Light shade"></div>
          <div className="w-3 h-3 bg-[#d4a574] rounded-full border border-[#ead2d8] hover:scale-125 transition-transform duration-200" title="Medium shade"></div>
          <div className="w-3 h-3 bg-[#9b5d6e] rounded-full border border-[#ead2d8] hover:scale-125 transition-transform duration-200" title="Dark shade"></div>
        </div>

        {/* Add to Bag Button */}
        <button
          onClick={handleAddToBag}
          className="w-full py-2.5 px-4 bg-white border-2 border-[#7a1f2b] text-[#7a1f2b] font-semibold rounded-lg hover:bg-[#7a1f2b] hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}