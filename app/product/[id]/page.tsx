"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
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

type AccordionKey = "description" | "details" | "delivery";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [openAccordion, setOpenAccordion] =
    useState<AccordionKey>("description");
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const scrollSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchReleaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchInteractingRef = useRef(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProductById(productId);
      setProduct(data.product);
      setReviews(data.reviews || []);
      setQuantity(1);

      const safeImages =
        Array.isArray(data.product.images) && data.product.images.length > 0
          ? data.product.images
          : ["/favicon/product.jpeg"];

      setCurrentImage(safeImages[0]);

      try {
        const inWishlist = await isInWishlist(data.product as any);
        setIsWishlisted(inWishlist);
      } catch {
        setIsWishlisted(false);
      }
    } catch (fetchError) {
      console.error("Error fetching product details:", fetchError);
      setError("We couldn't load this product right now.");
      setProduct(null);
      setReviews([]);
      setCurrentImage("/favicon/product.jpeg");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const safeImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return ["/favicon/product.jpeg"];
    }

    return product.images;
  }, [product]);

  const discount =
    product?.discountPercent ??
    (product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0);

  const currentImageIndex = safeImages.findIndex((image) => image === currentImage);
  const activeImageIndex = currentImageIndex >= 0 ? currentImageIndex : 0;

  const scrollMobileCarouselToIndex = (
    index: number,
    behavior: ScrollBehavior = "smooth"
  ) => {
    const track = mobileCarouselRef.current;
    if (!track) return;

    track.scrollTo({
      left: track.clientWidth * index,
      behavior,
    });
  };

  const showPreviousImage = () => {
    if (safeImages.length <= 1) return;

    const nextIndex =
      activeImageIndex <= 0 ? safeImages.length - 1 : activeImageIndex - 1;
    setCurrentImage(safeImages[nextIndex]);
  };

  const showNextImage = () => {
    if (safeImages.length <= 1) return;

    const nextIndex =
      activeImageIndex >= safeImages.length - 1 ? 0 : activeImageIndex + 1;
    setCurrentImage(safeImages[nextIndex]);
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
    }, 140);
  };

  const handleMobileTouchStart = () => {
    isTouchInteractingRef.current = true;

    if (touchReleaseTimeoutRef.current) {
      clearTimeout(touchReleaseTimeoutRef.current);
      touchReleaseTimeoutRef.current = null;
    }
  };

  const handleMobileTouchEnd = () => {
    if (touchReleaseTimeoutRef.current) {
      clearTimeout(touchReleaseTimeoutRef.current);
    }

    touchReleaseTimeoutRef.current = setTimeout(() => {
      isTouchInteractingRef.current = false;
      handleMobileCarouselScroll();
    }, 140);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    const track = mobileCarouselRef.current;
    if (!track) return;
    if (isTouchInteractingRef.current) return;

    const targetLeft = track.clientWidth * activeImageIndex;
    if (Math.abs(track.scrollLeft - targetLeft) < 4) return;

    scrollMobileCarouselToIndex(activeImageIndex, "smooth");
  }, [activeImageIndex]);

  useEffect(() => {
    return () => {
      if (scrollSyncTimeoutRef.current) {
        clearTimeout(scrollSyncTimeoutRef.current);
      }
      if (touchReleaseTimeoutRef.current) {
        clearTimeout(touchReleaseTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToBag = () => {
    if (!product || product.countInStock <= 0) return;

    const maxAllowed = Math.max(1, Math.min(quantity, product.countInStock));
    for (let index = 0; index < maxAllowed; index += 1) {
      addToCart(product as any);
    }

    showAddedToBagToast();
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    const next = await toggleWishlist(product as any);
    setIsWishlisted(next);
  };

  const handleBuyNow = () => {
    handleAddToBag();
    window.location.href = "/cart";
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

  const accordionItems = [
    {
      key: "description" as AccordionKey,
      title: "Description",
      content: product.description || product.shortDescription || "",
    },
    {
      key: "details" as AccordionKey,
      title: "Details",
      content: product.shortDescription || "",
    },
    {
      key: "delivery" as AccordionKey,
      title: "Shipping",
      content: "Delivery timelines depend on your location.",
    },
  ].filter((item) => item.content);

  return (
    <div className="product-page-root min-h-screen bg-[var(--surface-base)] px-4 py-8 md:px-8 md:py-10">
      <div className="fk-topbar md:hidden">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="fk-topbar-icon"
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white"
          />
          <input
            className="fk-topbar-search w-full pl-9"
            placeholder="Search products"
            readOnly
          />
        </div>
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="fk-topbar-icon"
          aria-label="Wishlist"
        >
          <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
        </button>
        <Link href="/cart" className="fk-topbar-icon" aria-label="Cart">
          <ShoppingCart size={18} />
        </Link>
      </div>

      <div className="section-shell">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
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

        <div className="fk-mobile-stack grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-4">
            <div className="fk-carousel product-gallery-mobile md:hidden">
              <div
                ref={mobileCarouselRef}
                className="fk-carousel-track product-gallery-mobile-track"
                onScroll={handleMobileCarouselScroll}
                onTouchStart={handleMobileTouchStart}
                onTouchEnd={handleMobileTouchEnd}
                onTouchCancel={handleMobileTouchEnd}
              >
                {safeImages.map((image, index) => (
                  <div
                    key={`${image}-mobile-${index}`}
                    className="fk-carousel-slide product-gallery-mobile-slide"
                  >
                    <img
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      className="fk-carousel-image product-gallery-mobile-image"
                    />
                  </div>
                ))}
              </div>

              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="fk-carousel-arrow product-gallery-mobile-arrow left-3"
                    aria-label="Show previous product image"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    onClick={showNextImage}
                    className="fk-carousel-arrow product-gallery-mobile-arrow right-3"
                    aria-label="Show next product image"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>

                  <div className="fk-img-count product-gallery-mobile-counter">
                    {activeImageIndex + 1} / {safeImages.length}
                  </div>

                  <div className="fk-dots product-gallery-mobile-dots">
                    {safeImages.map((image, index) => (
                      <button
                        key={`${image}-dot-${index}`}
                        type="button"
                        onClick={() => setCurrentImage(image)}
                        className={`fk-dot product-gallery-mobile-dot ${
                          activeImageIndex === index ? "active" : ""
                        }`}
                        aria-label={`Show product image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className="product-gallery-desktop-main glass-card relative overflow-hidden rounded-[32px]">
              <img
                src={currentImage || "/favicon/product.jpeg"}
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

                  <div className="absolute bottom-4 right-4 rounded-full bg-[rgba(47,36,31,0.75)] px-3 py-1 text-xs font-medium text-white">
                    {activeImageIndex + 1} / {safeImages.length}
                  </div>
                </>
              )}
            </div>

            <div className="thumbnail-grid grid grid-cols-4 gap-3 sm:grid-cols-5">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrentImage(image)}
                  className={`overflow-hidden rounded-[18px] border bg-white transition ${
                    currentImage === image
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
          </div>

          <div className="fk-mobile-main-card glass-card rounded-[32px] p-6 md:p-8">
            <div className="fk-title-section">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="fk-brand-tag text-[11px] uppercase tracking-[0.24em] text-[var(--brand-primary)]">
                    {product.brand || "Ewara Cosmetics"}
                  </p>
                  <h1 className="ewara-product-title fk-product-title mt-3 text-3xl font-semibold leading-tight tracking-[-0.05em] text-[var(--text-primary)] md:text-[3.35rem]">
                    {product.name}
                  </h1>
                </div>

                <div className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                  {product.category}
                </div>
              </div>

              <div className="fk-rating-row mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                <div className="hidden items-center gap-1 md:flex">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      className={
                        index < Math.round(product.rating)
                          ? "fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                          : "text-[#d7cec1]"
                      }
                    />
                  ))}
                </div>
                <span className="fk-rating-pill md:hidden">
                  {product.rating.toFixed(1)} ★
                </span>
                <span className="font-medium text-[var(--text-primary)] md:inline">
                  {product.rating.toFixed(1)}
                </span>
                <span className="hidden md:inline">&#8226;</span>
                <span className="hidden md:inline">
                  {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                </span>
                <span className="fk-rating-count md:hidden">
                  {product.numReviews} rating{product.numReviews === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="fk-price-section">
              {discount > 0 && (
                <p className="fk-discount-label md:hidden">{discount}% off</p>
              )}

              <div className="fk-price-row mt-7 flex flex-wrap items-center gap-3">
                <p className="ewara-price-main fk-price-main text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] md:text-[2.4rem]">
                  Rs. {product.price}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="ewara-price-old fk-price-old text-lg text-[var(--text-muted)] line-through">
                    Rs. {product.originalPrice}
                  </p>
                )}
                {discount > 0 && (
                  <span className="ewara-price-save fk-price-save rounded-full bg-[rgba(122,31,43,0.08)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="fk-price-tax md:hidden">Inclusive of all taxes</p>
              <p className="fk-emi-text md:hidden">EMI starting from Rs. 99/month</p>
            </div>

            <div className="fk-offers md:hidden">
              <div className="fk-offers-title">Available offers</div>
              <div className="fk-offer-row">
                <span className="fk-offer-tag">Bank</span>
                <span className="fk-offer-text">
                  10% off on <strong>HDFC Bank</strong> Credit Cards. T&amp;C apply
                </span>
              </div>
              <div className="fk-offer-row">
                <span className="fk-offer-tag">Special</span>
                <span className="fk-offer-text">
                  Buy 2 get <strong>Free Rose Toner</strong> worth Rs. 299
                </span>
              </div>
              <div className="fk-offer-row">
                <span className="fk-offer-tag">UPI</span>
                <span className="fk-offer-text">
                  5% cashback on <strong>PhonePe</strong> &amp; <strong>GPay</strong>
                </span>
              </div>
            </div>

            <div className="fk-delivery md:hidden">
              <div className="fk-delivery-title">Delivery options</div>
              <div className="fk-pin-row">
                <span className="fk-pin-icon">📍</span>
                <input className="fk-pin-input" placeholder="Enter pincode" />
                <span className="fk-pin-check">Check</span>
              </div>
              <div className="fk-del-row">
                <span className="fk-del-icon">🚚</span>
                <span className="fk-del-text">
                  Free delivery by <strong>Tomorrow</strong>
                </span>
              </div>
              <div className="fk-del-row">
                <span className="fk-del-icon">🔄</span>
                <span className="fk-del-text">7 days return policy</span>
              </div>
              <div className="fk-del-row">
                <span className="fk-del-icon">🛡️</span>
                <span className="fk-del-text">
                  <strong>100% Original</strong> sold by EWARA Official
                </span>
              </div>
            </div>

            <p className="ewara-product-desc mt-6 text-sm leading-7 text-[var(--text-secondary)]">
              {product.shortDescription || product.description}
            </p>

            <div className="fk-highlights ewara-meta-box mt-7 grid gap-5 rounded-[26px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.65)] p-5">
              <div className="fk-hl-title md:hidden">Product highlights</div>
              <div className="md:hidden">
                <div className="fk-hl-row">
                  <span className="fk-hl-key">Brand</span>
                  <span className="fk-hl-val">{product.brand || "Ewara"}</span>
                </div>
                <div className="fk-hl-row">
                  <span className="fk-hl-key">Category</span>
                  <span className="fk-hl-val">{product.category}</span>
                </div>
                <div className="fk-hl-row">
                  <span className="fk-hl-key">Stock</span>
                  <span className="fk-hl-val">{product.countInStock}</span>
                </div>
              </div>
              <div className="fk-highlights-pills flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                <span className="rounded-full bg-white px-3 py-2 text-[var(--brand-primary)]">
                  {product.brand || "Ewara Cosmetics"}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-[var(--brand-primary)]">
                  Category: {product.category}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-[var(--brand-primary)]">
                  Stock: {product.countInStock}
                </span>
              </div>
              <div className="fk-trust-section">
                <div className="ewara-trust-grid fk-trust-grid grid gap-3 sm:grid-cols-2">
                  <div className="ewara-trust-card fk-trust-card rounded-[20px] border border-[var(--border-soft)] bg-white px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[var(--brand-primary)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          Authentic quality
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Carefully curated beauty essentials
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ewara-trust-card fk-trust-card rounded-[20px] border border-[var(--border-soft)] bg-white px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-[var(--brand-primary)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          Smooth delivery
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Shipping timelines vary by location
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="fk-trust-bar md:hidden">
                  <div className="fk-tb-item">
                    <span className="fk-tb-icon">🌿</span>
                    <span className="fk-tb-label">Natural<br />Ingredients</span>
                  </div>
                  <div className="fk-tb-item">
                    <span className="fk-tb-icon">💧</span>
                    <span className="fk-tb-label">Sulphate<br />Free</span>
                  </div>
                  <div className="fk-tb-item">
                    <span className="fk-tb-icon">🧪</span>
                    <span className="fk-tb-label">Paraben<br />Free</span>
                  </div>
                  <div className="fk-tb-item">
                    <span className="fk-tb-icon">👥</span>
                    <span className="fk-tb-label">Men &amp;<br />Women</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ewara-qty-row mt-8 flex flex-wrap items-center gap-4">
              <div className="ewara-qty-box flex items-center rounded-full border border-[var(--border-soft)] bg-white shadow-card">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={product.countInStock <= 0}
                  className="px-4 py-3 text-[var(--brand-primary)] disabled:opacity-40"
                >
                  <Minus size={16} strokeWidth={1.8} />
                </button>
                <span className="min-w-[40px] text-center text-sm font-medium text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={product.countInStock <= 0 || quantity >= product.countInStock}
                  className="px-4 py-3 text-[var(--brand-primary)] disabled:opacity-40"
                >
                  <Plus size={16} strokeWidth={1.8} />
                </button>
              </div>

              <span
                className={`rounded-full px-3 py-2 text-xs ${
                  product.countInStock > 0
                    ? "bg-[rgba(122,31,43,0.08)] text-[var(--brand-primary)]"
                    : "bg-[#f5e9e7] text-[#9b4e4a]"
                }`}
              >
                {product.countInStock > 0
                  ? `${product.countInStock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <div className="mt-6 hidden gap-3 md:flex">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={product.countInStock <= 0}
                className="ewara-cart-btn flex-1 rounded-full bg-[var(--brand-primary)] px-6 py-4 text-sm font-medium text-white transition hover:bg-[var(--brand-primary-strong)] disabled:cursor-not-allowed disabled:bg-[#c9b7bb] md:flex"
              >
                Add {quantity > 1 ? `${quantity} to` : "to"} Cart
              </button>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition ${
                  isWishlisted
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                    : "border-[var(--border-soft)] bg-white text-[var(--brand-primary)]"
                } md:flex`}
              >
                <Heart
                  size={18}
                  className={isWishlisted ? "fill-current" : ""}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <div className="fk-bottom-bar md:hidden">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="fk-wish-btn"
              >
                Wishlist
              </button>
              <button
                type="button"
                onClick={handleAddToBag}
                className="fk-cart-btn"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="fk-buy-btn"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {accordionItems.length > 0 && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="ewara-accordion-card fk-accordion-card glass-card rounded-[32px] p-6 md:p-8">
              {accordionItems.map((item) => {
                const isOpen = openAccordion === item.key;

                return (
                  <div
                    key={item.key}
                    className={`${
                      item.key !== accordionItems[accordionItems.length - 1].key
                        ? "border-b border-[var(--border-soft)]"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAccordion(isOpen ? "description" : item.key)
                      }
                      className="ewara-accordion-row fk-accordion-row flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[var(--brand-primary)] transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="ewara-accordion-body fk-accordion-body pb-4 text-sm leading-7 text-[var(--text-secondary)]">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="fk-ratings-summary md:hidden">
              <div className="fk-rat-heading">Ratings &amp; Reviews</div>
              <div className="fk-rat-body">
                <div className="fk-rat-big-block">
                  <span className="fk-rat-number">4.7</span>
                  <span className="fk-rat-stars">★★★★★</span>
                  <span className="fk-rat-total">2,341 ratings</span>
                </div>
                <div className="fk-rat-bars">
                  <div className="fk-bar-row"><span className="fk-bar-label">5</span><div className="fk-bar-track"><div className="fk-bar-fill" style={{ width: "72%", background: "#3B6D11" }} /></div></div>
                  <div className="fk-bar-row"><span className="fk-bar-label">4</span><div className="fk-bar-track"><div className="fk-bar-fill" style={{ width: "18%", background: "#8B1A2A" }} /></div></div>
                  <div className="fk-bar-row"><span className="fk-bar-label">3</span><div className="fk-bar-track"><div className="fk-bar-fill" style={{ width: "6%", background: "#f0a060" }} /></div></div>
                  <div className="fk-bar-row"><span className="fk-bar-label">2</span><div className="fk-bar-track"><div className="fk-bar-fill" style={{ width: "2%", background: "#d4a8a0" }} /></div></div>
                  <div className="fk-bar-row"><span className="fk-bar-label">1</span><div className="fk-bar-track"><div className="fk-bar-fill" style={{ width: "1%", background: "#d4a8a0" }} /></div></div>
                </div>
              </div>
            </div>

            <div className="ewara-reviews-card fk-reviews-card glass-card rounded-[32px] p-6 md:p-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  Reviews
                </p>
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
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={15}
                              className={
                                index < review.rating
                                  ? "fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                                  : "text-[#d7cec1]"
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
                    No reviews available.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <ReviewForm productId={productId} onSubmitted={fetchProduct} />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 767px) {
          :global(body) {
            background: #fdfaf7 !important;
          }

          :global(.glass-card) {
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            border-top: 0.5px solid #f0ece6 !important;
            background: #fff !important;
            margin-top: 6px !important;
          }

          .fk-topbar {
            display: none !important;
          }

          .product-page-root {
            padding-top: 12px !important;
            padding-bottom: 12px !important;
          }

          .section-shell {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .fk-mobile-stack {
            gap: 0 !important;
          }

          .mb-8.flex.flex-wrap.items-center.gap-2.text-\[12px\].text-\[var\(--text-muted\)\] {
            display: none !important;
          }

          .fk-topbar-search {
            flex: 1 !important;
            background: rgba(255, 255, 255, 0.15) !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 7px 10px !important;
            color: #fff !important;
            font-size: 12px !important;
          }

          .fk-topbar-search::placeholder {
            color: rgba(255, 255, 255, 0.82) !important;
          }

          .fk-topbar-icon {
            color: #fff !important;
            font-size: 18px !important;
          }

          .fk-mobile-main-card {
            margin-top: 0 !important;
            border-top: none !important;
            border-radius: 0 0 14px 14px !important;
            overflow: hidden !important;
            padding: 0 !important;
          }

          .product-gallery-desktop-main,
          .thumbnail-grid {
            display: none !important;
          }

          .fk-carousel,
          .product-gallery-mobile {
            background: #f5efe8 !important;
            height: 318px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
          }

          .fk-carousel-track,
          .product-gallery-mobile-track {
            display: flex !important;
            overflow-x: scroll !important;
            scroll-snap-type: x mandatory !important;
            scrollbar-width: none !important;
            -webkit-overflow-scrolling: touch !important;
            height: 318px !important;
            overscroll-behavior-x: contain !important;
            touch-action: pan-x pinch-zoom !important;
          }

          .fk-carousel-track::-webkit-scrollbar,
          .product-gallery-mobile-track::-webkit-scrollbar {
            display: none;
          }

          .fk-carousel-slide,
          .product-gallery-mobile-slide {
            min-width: 100% !important;
            height: 318px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            scroll-snap-align: start !important;
            scroll-snap-stop: always !important;
            flex-shrink: 0 !important;
            padding: 12px 18px 18px !important;
            background: #f5efe8 !important;
          }

          .fk-carousel-image,
          .product-gallery-mobile-image {
            width: 100% !important;
            height: 100% !important;
            max-height: 288px !important;
            object-fit: contain !important;
            display: block !important;
          }

          .fk-carousel-arrow,
          .product-gallery-mobile-arrow {
            position: absolute !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 30px !important;
            height: 30px !important;
            background: #fff !important;
            border-radius: 50% !important;
            border: 0.5px solid #d4a8a0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            z-index: 10 !important;
            color: #8a6050 !important;
            padding: 0 !important;
          }

          .fk-img-count,
          .product-gallery-mobile-counter {
            position: absolute !important;
            bottom: 14px !important;
            right: 12px !important;
            background: rgba(44, 26, 14, 0.35) !important;
            color: #fff !important;
            font-size: 10px !important;
            padding: 2px 8px !important;
            border-radius: 10px !important;
            z-index: 5 !important;
          }

          .fk-dots,
          .product-gallery-mobile-dots {
            display: flex !important;
            justify-content: center !important;
            gap: 5px !important;
            padding: 0 !important;
            background: transparent !important;
            position: absolute !important;
            left: 50% !important;
            bottom: 16px !important;
            transform: translateX(-50%) !important;
            z-index: 5 !important;
          }

          .fk-dot,
          .product-gallery-mobile-dot {
            width: 6px !important;
            height: 6px !important;
            border-radius: 3px !important;
            background: rgba(139, 26, 42, 0.2) !important;
            border: none !important;
            cursor: pointer !important;
            padding: 0 !important;
            transition: all 0.2s ease !important;
          }

          .fk-dot.active,
          .product-gallery-mobile-dot.active {
            width: 18px !important;
            background: #8b1a2a !important;
          }

          .fk-title-section {
            background: transparent !important;
            margin-top: 0 !important;
            padding: 10px 14px 8px !important;
          }

          .fk-brand-tag {
            font-size: 11px !important;
            color: #8b1a2a !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            margin-bottom: 4px !important;
          }

          .fk-product-title,
          .ewara-product-title {
            font-size: 15px !important;
            font-weight: 400 !important;
            color: #2c1a0e !important;
            line-height: 1.4 !important;
            margin-bottom: 8px !important;
            margin-top: 10px !important;
          }

          .fk-rating-row {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          .fk-rating-pill {
            background: #3b6d11 !important;
            color: #fff !important;
            font-size: 11px !important;
            padding: 2px 7px !important;
            border-radius: 4px !important;
          }

          .fk-rating-count {
            font-size: 11px !important;
            color: #8a6050 !important;
          }

          .fk-price-section,
          .fk-offers,
          .fk-delivery,
          .fk-highlights,
          .fk-trust-section,
          .fk-ratings-summary,
          .fk-reviews-card {
            background: transparent !important;
            margin-top: 0 !important;
            padding: 10px 14px !important;
            border-top: 0.5px solid #f0ece6 !important;
          }

          .fk-discount-label {
            color: #3b6d11 !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            margin-bottom: 2px !important;
          }

          .fk-price-row {
            display: flex !important;
            align-items: baseline !important;
            gap: 10px !important;
            margin-bottom: 2px !important;
          }

          .fk-price-main,
          .ewara-price-main {
            font-size: 24px !important;
            font-weight: 500 !important;
            color: #2c1a0e !important;
          }

          .fk-price-old,
          .ewara-price-old {
            font-size: 13px !important;
            color: #b89880 !important;
            text-decoration: line-through !important;
          }

          .fk-price-save,
          .ewara-price-save {
            font-size: 12px !important;
            color: #3b6d11 !important;
            background: #f0f8f0 !important;
            padding: 3px 8px !important;
            border-radius: 20px !important;
          }

          .fk-price-tax {
            font-size: 10px !important;
            color: #a07060 !important;
          }

          .fk-emi-text {
            font-size: 11px !important;
            color: #8b1a2a !important;
            margin-top: 4px !important;
          }

          .fk-offers-title,
          .fk-delivery-title,
          .fk-hl-title,
          .fk-rat-heading {
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #2c1a0e !important;
            margin-bottom: 8px !important;
          }

          .fk-offer-row,
          .fk-del-row,
          .fk-hl-row {
            display: flex !important;
            gap: 8px !important;
            align-items: flex-start !important;
            margin-bottom: 6px !important;
          }

          .fk-offer-tag {
            background: #fbeaf0 !important;
            color: #8b1a2a !important;
            font-size: 10px !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            font-weight: 500 !important;
            white-space: nowrap !important;
            margin-top: 1px !important;
          }

          .fk-offer-text,
          .fk-del-text {
            font-size: 11px !important;
            color: #2c1a0e !important;
            line-height: 1.4 !important;
          }

          .fk-pin-row {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            border: 0.5px solid #d4a8a0 !important;
            border-radius: 6px !important;
            padding: 8px 10px !important;
            margin-bottom: 8px !important;
          }

          .fk-pin-input {
            border: none !important;
            background: none !important;
            font-size: 12px !important;
            flex: 1 !important;
            color: #2c1a0e !important;
            outline: none !important;
          }

          .fk-pin-check {
            color: #8b1a2a !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
          }

          .fk-hl-key {
            font-size: 11px !important;
            color: #a07060 !important;
            width: 110px !important;
            flex-shrink: 0 !important;
          }

          .fk-hl-val {
            font-size: 11px !important;
            color: #2c1a0e !important;
            flex: 1 !important;
          }

          .ewara-product-desc {
            font-size: 12px !important;
            color: #8a6050 !important;
            line-height: 1.6 !important;
            margin-top: 0 !important;
            background: transparent !important;
            padding: 10px 14px !important;
            border-top: 0.5px solid #f0ece6 !important;
          }

          .ewara-meta-box,
          .fk-highlights {
            border: none !important;
            border-radius: 0 !important;
            padding: 10px 12px !important;
            background: transparent !important;
          }

          .fk-highlights-pills {
            display: none !important;
          }

          .ewara-trust-grid,
          .fk-trust-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }

          .ewara-trust-card,
          .fk-trust-card {
            background: #fdf5f0 !important;
            border-radius: 8px !important;
            padding: 10px !important;
            display: flex !important;
            gap: 8px !important;
            align-items: flex-start !important;
            border: none !important;
          }

          .fk-trust-bar {
            background: transparent !important;
            margin-top: 0 !important;
            padding: 10px 14px !important;
            display: flex !important;
            justify-content: space-around !important;
            border-top: 0.5px solid #f0ece6 !important;
          }

          .fk-tb-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 4px !important;
          }

          .fk-tb-icon {
            font-size: 20px !important;
          }

          .fk-tb-label {
            font-size: 9px !important;
            color: #a07060 !important;
            text-align: center !important;
            line-height: 1.3 !important;
          }

          .ewara-qty-row {
            display: none !important;
          }

          .ewara-qty-box {
            border-color: #d4a8a0 !important;
            border-radius: 24px !important;
            padding: 7px 16px !important;
          }

          .ewara-cart-btn {
            background: #8b1a2a !important;
            color: #fff !important;
            border-radius: 10px !important;
            padding: 13px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
          }

          .ewara-accordion-card,
          .fk-accordion-card {
            background: transparent !important;
            margin-top: 6px !important;
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-top: 0.5px solid #f0ece6 !important;
            border-bottom: 0.5px solid #f0ece6 !important;
          }

          .ewara-accordion-row,
          .fk-accordion-row {
            padding: 13px 14px !important;
            border-bottom: 0.5px solid #f0ece6 !important;
            font-size: 13px !important;
            color: #2c1a0e !important;
            font-weight: 400 !important;
          }

          .ewara-accordion-body,
          .fk-accordion-body {
            padding: 0 14px 12px !important;
            font-size: 11px !important;
            color: #8a6050 !important;
            line-height: 1.7 !important;
          }

          .fk-rat-body {
            display: flex !important;
            gap: 14px !important;
            align-items: center !important;
          }

          .fk-rat-big-block {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 2px !important;
          }

          .fk-rat-number {
            font-size: 36px !important;
            font-weight: 500 !important;
            color: #2c1a0e !important;
            line-height: 1 !important;
          }

          .fk-rat-stars {
            font-size: 13px !important;
            color: #d4800a !important;
          }

          .fk-rat-total {
            font-size: 10px !important;
            color: #a07060 !important;
          }

          .fk-rat-bars {
            flex: 1 !important;
          }

          .fk-bar-row {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-bottom: 4px !important;
          }

          .fk-bar-label {
            font-size: 10px !important;
            color: #a07060 !important;
            width: 10px !important;
          }

          .fk-bar-track {
            flex: 1 !important;
            height: 4px !important;
            background: #f0ece6 !important;
            border-radius: 2px !important;
            overflow: hidden !important;
          }

          .fk-bar-fill {
            height: 100% !important;
            border-radius: 2px !important;
          }

          .fk-reviews-card {
            background: transparent !important;
            margin-top: 0 !important;
            padding: 8px 14px 12px !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border-top: 0.5px solid #f0ece6 !important;
          }

          .fk-bottom-bar {
            position: sticky !important;
            bottom: 0 !important;
            background: #fff !important;
            border-top: 0.5px solid #f0ece6 !important;
            padding: 10px 14px !important;
            display: flex !important;
            gap: 8px !important;
            z-index: 100 !important;
            margin: 0 !important;
            width: 100% !important;
            left: 0 !important;
            box-sizing: border-box !important;
          }

          .fk-wish-btn,
          .fk-cart-btn,
          .fk-buy-btn {
            flex: 1 !important;
            border-radius: 4px !important;
            padding: 12px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            min-width: 0 !important;
            white-space: nowrap !important;
          }

          .fk-wish-btn {
            border: 1.5px solid #8b1a2a !important;
            background: #fff !important;
            color: #8b1a2a !important;
          }

          .fk-cart-btn {
            background: #ff6000 !important;
            color: #fff !important;
            border: none !important;
          }

          .fk-buy-btn {
            background: #8b1a2a !important;
            color: #fff !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
