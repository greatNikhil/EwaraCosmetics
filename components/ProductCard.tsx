"use client";

import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/utils/cart";
import { toggleWishlist, isInWishlist } from "@/utils/wishlist";
import { type Product } from "@/utils/productApi";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "arrival-featured" | "arrival-compact";
}

export default function ProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
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

    const checkWishlist = async () => {
      try {
        const liked = await isInWishlist(product as any);
        setIsLiked(liked);
      } catch {
        setIsLiked(false);
      }
    };

    checkWishlist();
  }, [product._id, product.images]);

  const toggleWishlistHandler = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowLiked = await toggleWishlist(product as any);
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

  if (variant === "arrival-featured") {
    return (
      <div
        className="group relative h-full cursor-pointer overflow-hidden rounded-[14px] border border-[#e7ddd6] bg-white"
        onClick={handleTitleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative overflow-hidden bg-[#f5f0eb]">
          <button
            onClick={toggleWishlistHandler}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#7f6b5f] transition hover:bg-white"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked
                  ? "fill-[#7a3d3d] text-[#7a3d3d]"
                  : "text-[#8d7a6f] hover:text-[#7a3d3d]"
              }`}
            />
          </button>

          <img
            src={currentImage}
            alt={product.name}
            className={`aspect-[5/6] w-full object-cover transition duration-500 ${
              isHovering ? "scale-[1.03]" : "scale-100"
            }`}
            onMouseEnter={() => {
              setCurrentImage(safeImages[1] || safeImages[0]);
            }}
            onMouseLeave={() => {
              setCurrentImage(safeImages[0]);
            }}
          />
        </div>

        <div className="space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8e7d72]">
              {product.category || product.brand || "Collection"}
            </p>
            <p className="whitespace-nowrap text-sm font-medium text-[#30231d]">
              Rs. {product.price.toFixed(2)}
            </p>
          </div>

          <h3 className="text-[17px] font-medium leading-7 text-[#2f211d] transition-colors group-hover:text-[#6c5140]">
            {product.name}
          </h3>

          <p className="line-clamp-2 text-[13px] leading-6 text-[#7d6d62]">
            {product.shortDescription || product.description}
          </p>

          <button
            onClick={handleAddToBag}
            className="w-full rounded-full bg-[#7b5b45] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#624735]"
          >
            Add to Bag
          </button>
        </div>
      </div>
    );
  }

  if (variant === "arrival-compact") {
    return (
      <div
        className="group relative flex h-full cursor-pointer gap-4 rounded-[14px] border border-[#e7ddd6] bg-white p-4"
        onClick={handleTitleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative h-[84px] w-[84px] flex-shrink-0 overflow-hidden rounded-[12px] bg-[#f5f0eb]">
          <button
            onClick={toggleWishlistHandler}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#7f6b5f]"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                isLiked
                  ? "fill-[#7a3d3d] text-[#7a3d3d]"
                  : "text-[#8d7a6f] hover:text-[#7a3d3d]"
              }`}
            />
          </button>

          <img
            src={currentImage}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-500 ${
              isHovering ? "scale-[1.04]" : "scale-100"
            }`}
            onMouseEnter={() => {
              setCurrentImage(safeImages[1] || safeImages[0]);
            }}
            onMouseLeave={() => {
              setCurrentImage(safeImages[0]);
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex items-center gap-1 text-[11px] text-[#7f6b5f]">
              <Star
                size={12}
                className={`${
                  product.rating > 0
                    ? "fill-[#7b5b45] text-[#7b5b45]"
                    : "text-[#d6c7bb]"
                }`}
              />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="truncate text-[14px] font-medium text-[#2f211d]">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#7d6d62]">
            {product.shortDescription || product.description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#30231d]">
              Rs. {product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToBag}
              className="rounded-full border border-[#cbb8aa] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#7b5b45] transition hover:bg-[#fbf7f2]"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative h-full cursor-pointer overflow-hidden rounded-[14px] border border-[#eadfd5] bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(53,39,28,0.06)]"
      onClick={handleTitleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative overflow-hidden bg-[#f7f1ea]">
        <button
          onClick={toggleWishlistHandler}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#7a695d] shadow-sm transition hover:scale-105 hover:bg-white"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors duration-300 ${
              isLiked
                ? "fill-[#7a3d3d] text-[#7a3d3d]"
                : "text-[#8d7a6f] hover:text-[#7a3d3d]"
            }`}
          />
        </button>

        <img
          src={currentImage}
          alt={product.name}
          className={`aspect-[4/5] w-full object-cover transition duration-500 ${
            isHovering ? "scale-[1.04]" : "scale-100"
          }`}
          onMouseEnter={() => {
            setCurrentImage(safeImages[1] || safeImages[0]);
          }}
          onMouseLeave={() => {
            setCurrentImage(safeImages[0]);
          }}
        />
      </div>

      <div className="flex h-full flex-col p-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8f7a68]">
              {product.category || product.brand || "Collection"}
            </p>

            <div className="flex items-center gap-0.5 text-[10px] text-[#7a695d]">
              <Star
                size={10}
                className={`${
                  product.rating > 0
                    ? "fill-[#7b5b45] text-[#7b5b45]"
                    : "text-[#d6c7bb]"
                }`}
              />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-[13px] font-medium leading-4 text-[#30231d] transition-colors group-hover:text-[#6a4a36]">
            {product.name}
          </h3>

          <p className="line-clamp-1 text-[11px] leading-4 text-[#7a695d]">
            {product.shortDescription || product.description}
          </p>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-[14px] font-medium text-[#30231d]">
              Rs. {product.price.toFixed(2)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex items-center gap-1.5 text-[10px] text-[#9b8a7f]">
                <span className="line-through">Rs. {product.originalPrice}</span>
                {discount > 0 && <span>{discount}% off</span>}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToBag}
            className="rounded-full bg-[#7b5b45] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#624735]"
          >
            Add
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[#f0e6dd] pt-2 text-[10px] text-[#8f7a68]">
          <span>
            {product.numReviews > 0
              ? `${product.numReviews} review${product.numReviews === 1 ? "" : "s"}`
              : "No reviews"}
          </span>
        </div>
      </div>
    </div>
  );
}
