"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  LoaderCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import {
  getProductById,
  type Product,
  type ProductReview,
} from "@/utils/productApi";
import { addToCart } from "@/utils/cart";
import { showAddedToBagToast } from "@/utils/bagToast";
import { isInWishlist, toggleWishlist } from "@/utils/wishlist";
import ReviewForm from "@/components/services/ReviewForm";

const FALLBACK_IMAGE = "/favicon/product.jpeg";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);

const getRatingLabel = (rating: number, total: number) => {
  if (total <= 0) return "Fresh arrival";
  return `${rating.toFixed(1)} rating from ${total} review${total === 1 ? "" : "s"}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(FALLBACK_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [isAddingToBag, setIsAddingToBag] = useState(false);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const scrollSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProductById(productId);
      const nextProduct = data.product;
      const nextImages =
        Array.isArray(nextProduct.images) && nextProduct.images.length > 0
          ? nextProduct.images
          : [FALLBACK_IMAGE];

      setProduct(nextProduct);
      setReviews(data.reviews || []);
      setQuantity(1);
      setCurrentImage(nextImages[0]);

      try {
        setIsWishlisted(await isInWishlist(nextProduct as any));
      } catch {
        setIsWishlisted(false);
      }
    } catch (fetchError) {
      console.error("Error fetching product details:", fetchError);
      setError("We couldn't load this product right now.");
      setProduct(null);
      setReviews([]);
      setCurrentImage(FALLBACK_IMAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    return () => {
      if (scrollSyncTimeoutRef.current) {
        clearTimeout(scrollSyncTimeoutRef.current);
      }
    };
  }, []);

  const safeImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return [FALLBACK_IMAGE];
    }

    return product.images;
  }, [product]);

  const activeImageIndex = Math.max(
    0,
    safeImages.findIndex((image) => image === currentImage)
  );

  const discount =
    product?.discountPercent ??
    (product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0);

  const productDescription =
    product?.shortDescription || product?.description || "A refined Ewara beauty essential.";

  const benefits = useMemo(() => {
    if (!product) return [];

    return [
      product.shortDescription || `Curated for your ${product.category} routine.`,
      "Lightweight, easy to pair with your daily self-care ritual.",
      "Selected by Ewara Cosmetics with focus on comfort and finish.",
    ];
  }, [product]);

  const ingredientNotes = useMemo(() => {
    if (!product) return [];

    return [
      "See the product label for the complete ingredient list.",
      "Patch test before first use, especially for sensitive skin.",
      `Best suited for ${product.category.toLowerCase()} routines.`,
    ];
  }, [product]);

  const deliveryNotes = [
    "Secure checkout with order confirmation on email.",
    "Delivery timeline depends on your pincode and courier availability.",
    "Packed carefully by Ewara Official before dispatch.",
  ];

  const scrollMobileCarouselToIndex = (index: number) => {
    const track = mobileCarouselRef.current;
    if (!track) return;

    track.scrollTo({
      left: track.clientWidth * index,
      behavior: "smooth",
    });
  };

  const setImageByIndex = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, safeImages.length - 1));
    setCurrentImage(safeImages[boundedIndex] || FALLBACK_IMAGE);
    scrollMobileCarouselToIndex(boundedIndex);
  };

  const showPreviousImage = () => {
    if (safeImages.length <= 1) return;
    setImageByIndex(activeImageIndex <= 0 ? safeImages.length - 1 : activeImageIndex - 1);
  };

  const showNextImage = () => {
    if (safeImages.length <= 1) return;
    setImageByIndex(activeImageIndex >= safeImages.length - 1 ? 0 : activeImageIndex + 1);
  };

  const handleMobileCarouselScroll = () => {
    const track = mobileCarouselRef.current;
    if (!track || safeImages.length === 0) return;

    if (scrollSyncTimeoutRef.current) {
      clearTimeout(scrollSyncTimeoutRef.current);
    }

    scrollSyncTimeoutRef.current = setTimeout(() => {
      const slideWidth = track.clientWidth;
      if (!slideWidth) return;

      const nextIndex = Math.round(track.scrollLeft / slideWidth);
      const boundedIndex = Math.max(0, Math.min(nextIndex, safeImages.length - 1));
      const nextImage = safeImages[boundedIndex];

      if (nextImage && nextImage !== currentImage) {
        setCurrentImage(nextImage);
      }
    }, 100);
  };

  const handleAddToBag = async () => {
    if (!product || product.countInStock <= 0 || isAddingToBag) return false;

    const maxAllowed = Math.max(1, Math.min(quantity, product.countInStock));

    try {
      setIsAddingToBag(true);
      const added = await addToCart(product as any, maxAllowed);
      if (added) {
        showAddedToBagToast();
      }
      return Boolean(added);
    } catch (cartError) {
      console.error("Failed to add product to bag:", cartError);
      return false;
    } finally {
      setIsAddingToBag(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToBag();
    if (added) {
      router.push("/cart");
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || wishlistBusy) return;

    try {
      setWishlistBusy(true);
      const next = await toggleWishlist(product as any);
      setIsWishlisted(next);
    } finally {
      setWishlistBusy(false);
    }
  };

  const incrementQuantity = () => {
    if (!product || product.countInStock <= 0) return;
    setQuantity((prev) => Math.min(prev + 1, product.countInStock));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-base)] px-4 py-8 md:px-8 md:py-10">
        <div className="section-shell glass-card rounded-[32px] px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(122,31,43,0.08)] text-[var(--brand-primary)]">
            <LoaderCircle className="h-6 w-6 animate-spin" strokeWidth={1.8} />
          </div>
          <p className="mt-5 text-sm font-medium tracking-[0.08em] text-[var(--brand-primary)]">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--surface-base)] px-4 py-8 md:px-8 md:py-10">
        <div className="section-shell glass-card max-w-4xl rounded-[32px] px-6 py-16 text-center">
          <p className="text-2xl font-medium text-[var(--text-primary)]">
            Product not found
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            {error || "The product you are looking for is unavailable."}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--brand-primary-strong)]"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const outOfStock = product.countInStock <= 0;

  return (
    <div className="product-page-root min-h-screen bg-[var(--surface-base)] px-4 py-8 pb-28 md:px-8 md:py-10">
      <div className="section-shell">
        <div className="product-breadcrumb mb-8 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
          <Link href="/" className="transition hover:text-[var(--brand-primary)]">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="transition hover:text-[var(--brand-primary)]">
            Shop
          </Link>
          <ChevronRight size={14} />
          <span className="text-[var(--brand-primary)]">{product.name}</span>
        </div>

        <div className="product-layout grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="product-gallery space-y-4">
            <div className="mobile-hero md:hidden">
              <div className="mobile-hero-actions">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mobile-icon-btn"
                  aria-label="Go back"
                >
                  <ChevronLeft size={19} strokeWidth={1.8} />
                </button>
                <div className="mobile-hero-right">
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={wishlistBusy}
                    className={`mobile-icon-btn ${isWishlisted ? "active" : ""}`}
                    aria-label="Toggle wishlist"
                  >
                    <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
                  </button>
                  <Link href="/cart" className="mobile-icon-btn" aria-label="Open bag">
                    <ShoppingBag size={18} strokeWidth={1.8} />
                  </Link>
                </div>
              </div>

              <div
                ref={mobileCarouselRef}
                className="mobile-carousel"
                onScroll={handleMobileCarouselScroll}
              >
                {safeImages.map((image, index) => (
                  <div key={`${image}-mobile-${index}`} className="mobile-slide">
                    <img
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      className="mobile-image"
                    />
                  </div>
                ))}
              </div>

              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="mobile-gallery-arrow left"
                    aria-label="Show previous image"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="mobile-gallery-arrow right"
                    aria-label="Show next image"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>
                </>
              )}

              <div className="mobile-image-count">
                {activeImageIndex + 1} / {safeImages.length}
              </div>
            </div>

            <div className="desktop-hero glass-card relative overflow-hidden rounded-[32px]">
              <img
                src={currentImage || FALLBACK_IMAGE}
                alt={product.name}
                className="h-[420px] w-full object-cover md:h-[680px]"
              />

              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-primary)] shadow-soft transition hover:bg-white"
                    aria-label="Show previous product image"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-primary)] shadow-soft transition hover:bg-white"
                    aria-label="Show next product image"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>
                </>
              )}
            </div>

            <div className="thumbnail-grid grid grid-cols-4 gap-3 sm:grid-cols-5">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setImageByIndex(index)}
                  className={`overflow-hidden rounded-[18px] border bg-white transition ${
                    activeImageIndex === index
                      ? "border-[var(--brand-primary)] shadow-card"
                      : "border-[var(--border-soft)] hover:border-[var(--brand-primary)]/30"
                  }`}
                  aria-label={`Show product image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="product-info glass-card rounded-[32px] p-6 md:p-8">
            <div className="product-heading">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="brand-kicker text-[11px] uppercase tracking-[0.24em] text-[var(--brand-primary)]">
                    {product.brand || "Ewara Cosmetics"}
                  </p>
                  <h1 className="product-title mt-3 text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-[3.35rem]">
                    {product.name}
                  </h1>
                </div>
                <span className="category-pill rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                  {product.category}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="rating-chip inline-flex items-center gap-1 rounded-full bg-[#315f36] px-3 py-1 text-xs font-semibold text-white">
                  {product.rating.toFixed(1)}
                  <Star size={12} className="fill-current" />
                </span>
                <span>{getRatingLabel(product.rating, product.numReviews)}</span>
                <span className={outOfStock ? "text-[#a24b43]" : "text-[#315f36]"}>
                  {outOfStock ? "Out of stock" : `${product.countInStock} in stock`}
                </span>
              </div>
            </div>

            <div className="price-panel mt-7 rounded-[26px] border border-[var(--border-soft)] bg-white/80 p-5">
              {discount > 0 && (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#315f36]">
                  {discount}% off today
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <p className="text-3xl font-semibold text-[var(--text-primary)] md:text-[2.4rem]">
                  Rs. {formatPrice(product.price)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-lg text-[var(--text-muted)] line-through">
                    Rs. {formatPrice(product.originalPrice)}
                  </p>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-[rgba(122,31,43,0.08)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
                    Save {discount}%
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Inclusive of all taxes. Shipping calculated at checkout.
              </p>
            </div>

            <p className="mt-6 text-sm leading-7 text-[var(--text-secondary)]">
              {productDescription}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-[var(--border-soft)] bg-white shadow-card">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={outOfStock || quantity <= 1}
                  className="px-4 py-3 text-[var(--brand-primary)] disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} strokeWidth={1.8} />
                </button>
                <span className="min-w-[40px] text-center text-sm font-medium text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={outOfStock || quantity >= product.countInStock}
                  className="px-4 py-3 text-[var(--brand-primary)] disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} strokeWidth={1.8} />
                </button>
              </div>
              <span className="rounded-full bg-[rgba(122,31,43,0.08)] px-3 py-2 text-xs text-[var(--brand-primary)]">
                {outOfStock ? "Currently unavailable" : "Ready to add"}
              </span>
            </div>

            <div className="desktop-action-row mt-6 hidden gap-3 md:flex">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={outOfStock || isAddingToBag}
                className="flex-1 rounded-full bg-[var(--brand-primary)] px-6 py-4 text-sm font-medium text-white transition hover:bg-[var(--brand-primary-strong)] disabled:cursor-not-allowed disabled:bg-[#c9b7bb]"
              >
                {isAddingToBag
                  ? "Adding..."
                  : `Add ${quantity > 1 ? `${quantity} to` : "to"} Bag`}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={outOfStock || isAddingToBag}
                className="flex-1 rounded-full bg-[#2e211d] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#1f1714] disabled:cursor-not-allowed disabled:bg-[#c9b7bb]"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistBusy}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition ${
                  isWishlisted
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                    : "border-[var(--border-soft)] bg-white text-[var(--brand-primary)]"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={18}
                  className={isWishlisted ? "fill-current" : ""}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <div className="trust-strip mt-7 grid gap-3 sm:grid-cols-3">
              <div className="trust-item">
                <ShieldCheck size={18} />
                <span>Authentic quality</span>
              </div>
              <div className="trust-item">
                <Truck size={18} />
                <span>Careful dispatch</span>
              </div>
              <div className="trust-item">
                <PackageCheck size={18} />
                <span>Secure checkout</span>
              </div>
            </div>
          </section>
        </div>

        <section className="details-grid mt-8 grid gap-5 lg:grid-cols-4">
          <article className="detail-card">
            <div className="detail-icon">
              <Sparkles size={18} />
            </div>
            <h2>Benefits</h2>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-icon">
              <ShieldCheck size={18} />
            </div>
            <h2>Ingredients</h2>
            <ul>
              {ingredientNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-icon">
              <Truck size={18} />
            </div>
            <h2>Delivery</h2>
            <ul>
              {deliveryNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>

          <article className="detail-card reviews-summary">
            <div className="detail-icon">
              <Star size={18} />
            </div>
            <h2>Reviews</h2>
            <div className="review-score">
              <span>{product.rating.toFixed(1)}</span>
              <div>
                <div className="review-stars" aria-label={`${product.rating.toFixed(1)} star rating`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={13}
                      className={
                        index < Math.round(product.rating)
                          ? "fill-current"
                          : "opacity-30"
                      }
                    />
                  ))}
                </div>
                <p>
                  {reviews.length > 0
                    ? `${reviews.length} customer review${reviews.length === 1 ? "" : "s"}`
                    : "Be the first to review"}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="reviews-section mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card rounded-[32px] p-6 md:p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  Customer notes
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                  Reviews
                </h2>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {reviews.length > 0
                  ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                  : "0 reviews"}
              </p>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-[22px] border border-[var(--border-soft)] bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {review.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {new Date(review.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--brand-accent)]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={15}
                            className={
                              index < review.rating ? "fill-current" : "opacity-30"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-[var(--border-soft)] bg-white/60 px-5 py-10 text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  No reviews yet.
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Share the first note after trying this product.
                </p>
              </div>
            )}
          </div>

          <div className="review-form-wrap">
            <ReviewForm productId={productId} onSubmitted={fetchProduct} />
          </div>
        </section>
      </div>

      <div className="mobile-action-bar md:hidden">
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={wishlistBusy}
          className={`mobile-wishlist ${isWishlisted ? "active" : ""}`}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
        </button>
        <button
          type="button"
          onClick={handleAddToBag}
          disabled={outOfStock || isAddingToBag}
          className="mobile-add-bag"
        >
          <ShoppingBag size={17} />
          {isAddingToBag ? "Adding" : "Bag"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock || isAddingToBag}
          className="mobile-buy-now"
        >
          Buy Now
        </button>
      </div>

      <style jsx>{`
        .product-title {
          letter-spacing: 0;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--border-soft);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.72);
          padding: 14px;
          color: var(--brand-primary);
          font-size: 12px;
          font-weight: 600;
        }

        .detail-card {
          border: 1px solid var(--border-soft);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.82);
          padding: 22px;
          box-shadow: 0 18px 50px rgba(47, 36, 31, 0.06);
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: rgba(122, 31, 43, 0.08);
          color: var(--brand-primary);
        }

        .detail-card h2 {
          margin-top: 16px;
          font-size: 16px;
          font-weight: 650;
          color: var(--text-primary);
        }

        .detail-card ul {
          margin-top: 14px;
          display: grid;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
        }

        .detail-card li {
          position: relative;
          padding-left: 16px;
        }

        .detail-card li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.75em;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--brand-primary);
        }

        .review-score {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .review-score > span {
          font-size: 42px;
          font-weight: 650;
          line-height: 1;
          color: var(--text-primary);
        }

        .review-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: var(--brand-accent);
        }

        .review-score p {
          margin-top: 5px;
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 767px) {
          .product-page-root {
            padding: 0 0 98px !important;
            background:
              linear-gradient(180deg, #fff8f1 0%, #fbf3ec 42%, #fffaf7 100%) !important;
          }

          .section-shell {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .product-breadcrumb,
          .desktop-hero,
          .thumbnail-grid,
          .category-pill,
          .desktop-action-row {
            display: none !important;
          }

          .product-layout {
            display: block !important;
          }

          .product-gallery {
            position: relative;
            margin: 0 !important;
            padding: 0 !important;
          }

          .mobile-hero {
            position: relative;
            height: clamp(360px, 116vw, 520px);
            max-height: 72svh;
            min-height: 360px;
            overflow: hidden;
            border-radius: 0 0 30px 30px;
            background:
              radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 34%),
              linear-gradient(150deg, #f9e3d8 0%, #f6d4d3 44%, #fff4e8 100%);
          }

          .mobile-hero::after {
            content: "";
            position: absolute;
            left: 22px;
            right: 22px;
            bottom: 34px;
            height: 74px;
            border-radius: 50%;
            background: rgba(73, 42, 27, 0.12);
            filter: blur(16px);
            pointer-events: none;
          }

          .mobile-hero-actions {
            position: absolute;
            left: 14px;
            right: 14px;
            top: 14px;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .mobile-hero-right {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .mobile-icon-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid rgba(255, 255, 255, 0.65);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.72);
            color: #7a1f2b;
            box-shadow: 0 14px 30px rgba(68, 38, 28, 0.12);
            backdrop-filter: blur(14px);
          }

          .mobile-icon-btn.active {
            background: #7a1f2b;
            color: #fff;
          }

          .mobile-carousel {
            display: flex;
            height: 100%;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            touch-action: pan-x pan-y;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-carousel::-webkit-scrollbar {
            display: none;
          }

          .mobile-slide {
            display: flex;
            min-width: 100%;
            align-items: center;
            justify-content: center;
            scroll-snap-align: start;
            scroll-snap-stop: always;
            padding: 68px 24px 52px;
            box-sizing: border-box;
          }

          .mobile-image {
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            max-width: min(86vw, 390px);
            max-height: 100%;
            object-fit: contain;
            object-position: center;
            filter: drop-shadow(0 24px 32px rgba(55, 32, 22, 0.18));
          }

          .mobile-gallery-arrow {
            position: absolute;
            z-index: 4;
            top: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.72);
            color: #7a1f2b;
            box-shadow: 0 10px 24px rgba(68, 38, 28, 0.12);
            transform: translateY(-50%);
          }

          .mobile-gallery-arrow.left {
            left: 12px;
          }

          .mobile-gallery-arrow.right {
            right: 12px;
          }

          .mobile-image-count {
            position: absolute;
            right: 16px;
            bottom: 16px;
            z-index: 4;
            border-radius: 999px;
            background: rgba(48, 30, 24, 0.68);
            padding: 5px 10px;
            color: #fff;
            font-size: 11px;
            font-weight: 650;
          }

          .product-info {
            margin: -26px 12px 0 !important;
            position: relative;
            z-index: 6;
            border: 1px solid rgba(255, 255, 255, 0.72) !important;
            border-radius: 28px !important;
            background: rgba(255, 255, 255, 0.92) !important;
            padding: 20px !important;
            box-shadow: 0 20px 55px rgba(59, 37, 30, 0.13) !important;
            backdrop-filter: blur(16px);
          }

          @media (max-width: 380px) {
            .mobile-hero {
              height: clamp(340px, 122vw, 480px);
              min-height: 340px;
            }

            .mobile-slide {
              padding: 64px 20px 50px;
            }
          }

          .brand-kicker {
            font-size: 10px !important;
            letter-spacing: 0.18em !important;
          }

          .product-title {
            margin-top: 8px !important;
            font-size: 24px !important;
            line-height: 1.14 !important;
          }

          .rating-chip {
            border-radius: 8px !important;
          }

          .price-panel {
            margin-top: 18px !important;
            border-radius: 22px !important;
            background: linear-gradient(135deg, #fff 0%, #fff7f1 100%) !important;
            padding: 16px !important;
          }

          .trust-strip {
            grid-template-columns: 1fr !important;
          }

          .trust-item {
            border-radius: 16px;
            padding: 12px;
          }

          .details-grid {
            margin: 16px 12px 0 !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .detail-card {
            border-radius: 22px;
            padding: 18px;
            box-shadow: 0 16px 42px rgba(59, 37, 30, 0.08);
          }

          .detail-card h2 {
            font-size: 15px;
          }

          .detail-card ul {
            font-size: 12px;
          }

          .reviews-section {
            display: block !important;
            margin: 16px 12px 0 !important;
          }

          .reviews-section :global(.glass-card),
          .review-form-wrap :global(.glass-card) {
            border-radius: 22px !important;
            box-shadow: 0 16px 42px rgba(59, 37, 30, 0.08) !important;
          }

          .review-form-wrap {
            margin-top: 16px;
          }

          .mobile-action-bar {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 60;
            display: grid;
            grid-template-columns: 52px 1fr 1fr;
            gap: 10px;
            border-top: 1px solid rgba(122, 31, 43, 0.12);
            background: rgba(255, 255, 255, 0.92);
            padding: 10px 12px 12px;
            box-shadow: 0 -18px 38px rgba(54, 35, 28, 0.12);
            backdrop-filter: blur(16px);
          }

          .mobile-wishlist,
          .mobile-add-bag,
          .mobile-buy-now {
            display: inline-flex;
            min-height: 48px;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 750;
          }

          .mobile-wishlist {
            border: 1px solid rgba(122, 31, 43, 0.2);
            background: #fff;
            color: #7a1f2b;
          }

          .mobile-wishlist.active {
            background: #7a1f2b;
            color: #fff;
          }

          .mobile-add-bag {
            background: #fff2e5;
            color: #7a1f2b;
          }

          .mobile-buy-now {
            background: #7a1f2b;
            color: #fff;
          }

          .mobile-add-bag:disabled,
          .mobile-buy-now:disabled {
            background: #d7c4c6;
            color: #fff;
          }
        }
      `}</style>
    </div>
  );
}
