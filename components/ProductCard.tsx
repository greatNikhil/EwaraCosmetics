"use client";

import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/utils/cart";
import { showAddedToBagToast } from "@/utils/bagToast";
import { toggleWishlist, isInWishlist } from "@/utils/wishlist";
import { type Product } from "@/utils/productApi";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "shop" | "arrival-featured" | "arrival-compact";
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
    showAddedToBagToast();
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

  const categoryLabel = product.category || product.brand || "Collection";

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

  if (variant === "shop") {
    return (
      <>
        <div
          className="product-card group relative h-full cursor-pointer overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white/92 transition duration-300 hover:-translate-y-1 hover:shadow-soft md:block"
          onClick={handleTitleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="hidden md:block">
            <div className="relative overflow-hidden bg-[#f5eee7]">
              <button
                onClick={toggleWishlistHandler}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#7a695d] shadow-sm transition hover:scale-105 hover:bg-white"
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

            <div className="flex h-full flex-col p-4 md:p-5">
              <div className="space-y-2">
                <div className="product-rating-row flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {categoryLabel}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
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

                <h3 className="text-[15px] font-semibold leading-6 tracking-[-0.02em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--brand-primary)] md:text-base">
                  {product.name}
                </h3>

                <p className="product-description line-clamp-2 text-[12px] leading-6 text-[var(--text-secondary)]">
                  {product.shortDescription || product.description}
                </p>
              </div>

              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                    Rs. {product.price.toFixed(2)}
                  </p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                      <span className="line-through">Rs. {product.originalPrice}</span>
                      {discount > 0 && <span>{discount}% off</span>}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddToBag}
                  className="desktop-add-btn rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[var(--brand-primary-strong)]"
                >
                  Add
                </button>
              </div>

              <div className="no-reviews-text mt-4 flex items-center justify-between border-t border-[#f0e6dd] pt-3 text-[11px] text-[var(--text-muted)]">
                <span>
                  {product.numReviews > 0
                    ? `${product.numReviews} review${product.numReviews === 1 ? "" : "s"}`
                    : "No reviews"}
                </span>
              </div>
            </div>
          </div>

          <div className="product-card md:hidden">
            <div className="card-image-wrapper bg-[#f5eee7]">
              <img
                src={currentImage}
                alt={product.name}
                className="mob-prod-img"
                onMouseEnter={() => {
                  setCurrentImage(safeImages[1] || safeImages[0]);
                }}
                onMouseLeave={() => {
                  setCurrentImage(safeImages[0]);
                }}
              />

              <button
                onClick={toggleWishlistHandler}
                className="card-wishlist-btn"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    isLiked ? "fill-[#7a1a2e] text-[#7a1a2e]" : "text-[#7a1a2e]"
                  }`}
                />
              </button>

              <div className="card-discount-banner">
                {discount > 0 ? `${discount}% off • ` : ""}
                {categoryLabel}
              </div>
            </div>

            <div className="card-body">
              <p className="card-name">{product.name}</p>

              <div className="card-bottom-row">
                <div className="mob-price-left">
                  <span className="mob-price-new">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <span className="mob-price-old">₹{product.originalPrice}</span>
                  ) : null}
                </div>

                <button className="card-add-btn" onClick={handleAddToBag}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .product-card {
              background: #fff !important;
              border-radius: 12px !important;
              overflow: hidden !important;
              border: 0.5px solid #f0e0e0 !important;
            }

            .product-card .card-image-wrapper {
              aspect-ratio: 4 / 5 !important;
              height: auto !important;
              min-height: 150px !important;
              position: relative !important;
              overflow: hidden !important;
            }

            .product-card .card-image-wrapper img {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              object-position: center center !important;
            }

            .product-card .card-discount-banner {
              position: absolute !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              background: rgba(122, 26, 46, 0.82) !important;
              color: #fff !important;
              font-size: 9px !important;
              font-weight: 600 !important;
              padding: 4px 7px !important;
              text-align: center !important;
              letter-spacing: 0.02em !important;
            }

            .product-card .card-wishlist-btn {
              position: absolute !important;
              top: 6px !important;
              right: 6px !important;
              width: 22px !important;
              height: 22px !important;
              background: rgba(255, 255, 255, 0.9) !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              border: none !important;
              cursor: pointer !important;
              padding: 0 !important;
            }

            .product-card .card-body {
              padding: 7px 8px !important;
            }

            .product-card .card-name {
              font-size: 11px !important;
              font-weight: 600 !important;
              color: #1a1a1a !important;
              line-height: 1.35 !important;
              margin: 0 0 6px !important;
              display: -webkit-box !important;
              -webkit-line-clamp: 2 !important;
              -webkit-box-orient: vertical !important;
              overflow: hidden !important;
            }

            .product-card .card-bottom-row {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
            }

            .product-card .mob-price-left {
              display: flex;
              flex-direction: column;
            }

            .product-card .mob-price-new,
            .product-card .card-price-new {
              font-size: 13px !important;
              font-weight: 700 !important;
              color: #7a1a2e !important;
              display: block !important;
            }

            .product-card .mob-price-old,
            .product-card .card-price-old {
              font-size: 9px !important;
              color: #aaa !important;
              text-decoration: line-through !important;
              display: block !important;
            }

            .product-card .card-add-btn {
              width: 30px !important;
              height: 30px !important;
              background: #7a1a2e !important;
              color: #fff !important;
              border: none !important;
              border-radius: 50% !important;
              font-size: 20px !important;
              font-weight: 300 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              cursor: pointer !important;
              flex-shrink: 0 !important;
              line-height: 1 !important;
              padding: 0 !important;
            }

            .product-card .card-description,
            .product-card .card-rating,
            .product-card .card-reviews,
            .product-card .desktop-add-btn,
            .product-card .product-description,
            .product-card .product-rating-row,
            .product-card .no-reviews-text {
              display: none !important;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <div
      className="group relative h-full cursor-pointer overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white/92 transition duration-300 hover:-translate-y-1 hover:shadow-soft"
      onClick={handleTitleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative overflow-hidden bg-[#f5eee7]">
        <button
          onClick={toggleWishlistHandler}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#7a695d] shadow-sm transition hover:scale-105 hover:bg-white"
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

      <div className="flex h-full flex-col p-4 md:p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {product.category || product.brand || "Collection"}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
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

          <h3 className="text-[15px] font-semibold leading-6 tracking-[-0.02em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--brand-primary)] md:text-base">
            {product.name}
          </h3>

          <p className="line-clamp-2 text-[12px] leading-6 text-[var(--text-secondary)]">
            {product.shortDescription || product.description}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              Rs. {product.price.toFixed(2)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span className="line-through">Rs. {product.originalPrice}</span>
                {discount > 0 && <span>{discount}% off</span>}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToBag}
            className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[var(--brand-primary-strong)]"
          >
            Add
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#f0e6dd] pt-3 text-[11px] text-[var(--text-muted)]">
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
