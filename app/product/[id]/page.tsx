"use client";

import { useEffect, useMemo, useState } from "react";
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
  Star,
} from "lucide-react";
import {
  getProductById,
  type Product,
  type ProductReview,
} from "@/utils/productApi";
import { addToCart } from "@/utils/cart";
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

  const showPreviousImage = () => {
    if (safeImages.length <= 1) return;

    const nextIndex =
      currentImageIndex <= 0 ? safeImages.length - 1 : currentImageIndex - 1;
    setCurrentImage(safeImages[nextIndex]);
  };

  const showNextImage = () => {
    if (safeImages.length <= 1) return;

    const nextIndex =
      currentImageIndex >= safeImages.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImage(safeImages[nextIndex]);
  };

  const handleAddToBag = () => {
    if (!product || product.countInStock <= 0) return;

    const maxAllowed = Math.max(1, Math.min(quantity, product.countInStock));
    for (let index = 0; index < maxAllowed; index += 1) {
      addToCart(product as any);
    }

    alert("Added to bag!");
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    const next = await toggleWishlist(product as any);
    setIsWishlisted(next);
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
      <div className="min-h-screen bg-[#f7f3ec] px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#e6ddd2] bg-[#fffdf9] px-6 py-20 text-center shadow-[0_24px_60px_rgba(48,86,69,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf2ee] text-[#305645]">
            <LoaderCircle className="h-6 w-6 animate-spin" strokeWidth={1.8} />
          </div>
          <p className="mt-5 text-sm font-medium tracking-[0.08em] text-[#305645]">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f7f3ec] px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-[#e6ddd2] bg-[#fffdf9] px-6 py-16 text-center shadow-[0_24px_60px_rgba(48,86,69,0.08)]">
          <p className="text-2xl font-medium text-[#2f1c22]">
            Product not found
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#8c7a7a]">
            {error || "The product you are looking for is unavailable."}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[#305645] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#234235]"
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
    <div className="min-h-screen bg-[#f7f3ec] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[12px] text-[#8c7a7a]">
          <Link href="/" className="transition hover:text-[#305645]">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="transition hover:text-[#305645]">
            Shop
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#305645]">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[30px] border border-[#e7ddd2] bg-[#fffdf9] shadow-[0_22px_50px_rgba(48,86,69,0.08)]">
              <img
                src={currentImage || "/favicon/product.jpeg"}
                alt={product.name}
                className="h-[400px] w-full object-cover md:h-[620px]"
              />

              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#305645] shadow-[0_12px_24px_rgba(48,86,69,0.14)] transition hover:bg-white"
                    aria-label="Show previous product image"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#305645] shadow-[0_12px_24px_rgba(48,86,69,0.14)] transition hover:bg-white"
                    aria-label="Show next product image"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>

                  <div className="absolute bottom-4 right-4 rounded-full bg-[#2f1c22]/75 px-3 py-1 text-xs font-medium text-white">
                    {currentImageIndex + 1} / {safeImages.length}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrentImage(image)}
                  className={`overflow-hidden rounded-[18px] border bg-white transition ${
                    currentImage === image
                      ? "border-[#305645] shadow-[0_10px_24px_rgba(48,86,69,0.14)]"
                      : "border-[#e7ddd2] hover:border-[#cdd9d1]"
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

          <div className="rounded-[30px] border border-[#e7ddd2] bg-[#fffdf9] p-6 shadow-[0_22px_50px_rgba(48,86,69,0.08)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#305645]">
                  {product.brand || "Ewara Cosmetics"}
                </p>
                <h1 className="mt-3 text-3xl font-medium leading-tight text-[#2f1c22] md:text-[3.2rem]">
                  {product.name}
                </h1>
              </div>

              <div className="rounded-full border border-[#dbe7de] bg-[#edf2ee] px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[#305645]">
                {product.category}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#6f615f]">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={
                      index < Math.round(product.rating)
                        ? "fill-[#305645] text-[#305645]"
                        : "text-[#d7cec1]"
                    }
                  />
                ))}
              </div>
              <span className="font-medium text-[#2f1c22]">
                {product.rating.toFixed(1)}
              </span>
              <span>&#8226;</span>
              <span>{product.countInStock > 0 ? "In Stock" : "Out of Stock"}</span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-semibold text-[#305645] md:text-[2.2rem]">
                Rs. {product.price}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-lg text-[#b6a8a4] line-through">
                  Rs. {product.originalPrice}
                </p>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-[#e8f0ea] px-3 py-1 text-xs font-medium text-[#305645]">
                  Save {discount}%
                </span>
              )}
            </div>

            <p className="mt-6 text-sm leading-7 text-[#6f615f]">
              {product.shortDescription || product.description}
            </p>

            <div className="mt-7 grid gap-5 rounded-[24px] border border-[#eee4d8] bg-[#faf6ef] p-5">
              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-[#9d8d88]">
                <span className="rounded-full bg-white px-3 py-2 text-[#305645]">
                  Brand: {product.brand || "Ewara"}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-[#305645]">
                  Category: {product.category}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-[#305645]">
                  Stock: {product.countInStock}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-[#e7ddd2] bg-white shadow-[0_10px_24px_rgba(48,86,69,0.06)]">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={product.countInStock <= 0}
                  className="px-4 py-3 text-[#305645] disabled:opacity-40"
                >
                  <Minus size={16} strokeWidth={1.8} />
                </button>
                <span className="min-w-[40px] text-center text-sm font-medium text-[#2f1c22]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={product.countInStock <= 0 || quantity >= product.countInStock}
                  className="px-4 py-3 text-[#305645] disabled:opacity-40"
                >
                  <Plus size={16} strokeWidth={1.8} />
                </button>
              </div>

              <span
                className={`rounded-full px-3 py-2 text-xs ${
                  product.countInStock > 0
                    ? "bg-[#e8f0ea] text-[#305645]"
                    : "bg-[#f5e9e7] text-[#9b4e4a]"
                }`}
              >
                {product.countInStock > 0
                  ? `${product.countInStock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={product.countInStock <= 0}
                className="flex-1 rounded-full bg-[#305645] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#234235] disabled:cursor-not-allowed disabled:bg-[#b8c8c0]"
              >
                Add {quantity > 1 ? `${quantity} to` : "to"} Cart
              </button>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition ${
                  isWishlisted
                    ? "border-[#305645] bg-[#305645] text-white"
                    : "border-[#e7ddd2] bg-white text-[#305645]"
                }`}
              >
                <Heart
                  size={18}
                  className={isWishlisted ? "fill-current" : ""}
                  strokeWidth={1.8}
                />
              </button>
            </div>
          </div>
        </div>

        {accordionItems.length > 0 && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[30px] border border-[#e7ddd2] bg-[#fffdf9] p-6 shadow-[0_22px_50px_rgba(48,86,69,0.08)] md:p-8">
              {accordionItems.map((item) => {
                const isOpen = openAccordion === item.key;

                return (
                  <div
                    key={item.key}
                    className={`${
                      item.key !== accordionItems[accordionItems.length - 1].key
                        ? "border-b border-[#eee4d8]"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAccordion(isOpen ? "description" : item.key)
                      }
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="text-sm font-medium text-[#2f1c22]">
                        {item.title}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[#305645] transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-4 text-sm leading-7 text-[#6f615f]">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-[30px] border border-[#e7ddd2] bg-[#fffdf9] p-6 shadow-[0_22px_50px_rgba(48,86,69,0.08)] md:p-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#305645]">
                  Reviews
                </p>
                <p className="text-sm text-[#8c7a7a]">
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
                      className="rounded-[20px] border border-[#eee4d8] bg-[#faf6ef] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#2f1c22]">
                            {review.name}
                          </p>
                          <p className="mt-1 text-xs text-[#9c8d88]">
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
                                  ? "fill-[#305645] text-[#305645]"
                                  : "text-[#d7cec1]"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#6f615f]">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#d9cec1] bg-[#faf6ef] px-5 py-10 text-center">
                  <p className="text-sm font-medium text-[#2f1c22]">
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
    </div>
  );
}
