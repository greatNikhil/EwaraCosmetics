"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, type Product } from "@/utils/productApi";
import { ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";

const DEFAULT_CATEGORIES = ["Skincare", "Haircare", "Makeup"];
const COMING_SOON_CATEGORIES = new Set(["Haircare", "Makeup"]);
const SKIN_TYPE_OPTIONS = ["All Skin Types", "Dry", "Oily", "Combination"];
const RATING_OPTIONS = ["All", "4", "3", "2"];
const DEFAULT_FILTERS = {
  category: "All",
  rating: "All",
  skinType: "All Skin Types",
  priceMin: 0,
  priceMax: 125,
};

export function ShopContent() {
  const searchParams = useSearchParams();
  const mobileFilterSheetRef = useRef<HTMLDetailsElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [sortOption, setSortOption] = useState("newest");
  const querySearchTerm = searchParams.get("q") || "";

  useEffect(() => {
    setSearchTerm(querySearchTerm);
  }, [querySearchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProducts();
        const productsList = Array.isArray(data) ? data : data.products || [];
        const publishedProducts = productsList.filter(
          (product: Product) => product.isPublished === true
        );

        setProducts(publishedProducts);
      } catch (fetchError) {
        console.error("Error fetching shop products:", fetchError);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const buildCategories = (): string[] => {
    const dynamicCategories = new Set<string>(
      products.map((p) => p.category).filter(Boolean)
    );

    const allCategories = new Set<string>(DEFAULT_CATEGORIES);
    dynamicCategories.forEach((cat) => allCategories.add(cat));

    return ["All", ...Array.from(allCategories).sort()];
  };

  const categories = buildCategories();

  const categoryEntries = useMemo(() => {
    return categories.map((category) => ({
      label:
        category === "All"
          ? "All Products"
          : COMING_SOON_CATEGORIES.has(category)
            ? `${category} (Coming Soon)`
            : category,
      value: category,
      count:
        category === "All"
          ? products.length
          : products.filter((product) => product.category === category).length,
      comingSoon: COMING_SOON_CATEGORIES.has(category),
    }));
  }, [categories, products]);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      const matchesCategory =
        appliedFilters.category === "All" ||
        product.category === appliedFilters.category;

      const matchesRating =
        appliedFilters.rating === "All" ||
        product.rating >= Number(appliedFilters.rating);

      const matchesPrice =
        product.price >= appliedFilters.priceMin &&
        (appliedFilters.priceMax >= 125
          ? true
          : product.price <= appliedFilters.priceMax);

      return matchesSearch && matchesCategory && matchesRating && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "rating-high") {
        return b.rating - a.rating || b.numReviews - a.numReviews;
      }
      if (sortOption === "reviews-high") {
        return b.numReviews - a.numReviews || b.rating - a.rating;
      }
      if (sortOption === "price-low") {
        return a.price - b.price;
      }
      if (sortOption === "price-high") {
        return b.price - a.price;
      }
      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    if (mobileFilterSheetRef.current) {
      mobileFilterSheetRef.current.open = false;
    }
  };

  const applyCategory = (category: string) => {
    setDraftFilters((current) => ({
      ...current,
      category,
    }));

    setAppliedFilters((current) => ({
      ...current,
      category,
    }));
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSearchTerm("");
    if (mobileFilterSheetRef.current) {
      mobileFilterSheetRef.current.open = false;
    }
  };

  const resultSummary =
    filteredProducts.length > 0
      ? `Showing 1-${filteredProducts.length} of ${products.length} products`
      : `Showing 0 of ${products.length} products`;

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    appliedFilters.category !== DEFAULT_FILTERS.category ||
    appliedFilters.rating !== DEFAULT_FILTERS.rating ||
    appliedFilters.skinType !== DEFAULT_FILTERS.skinType ||
    appliedFilters.priceMin !== DEFAULT_FILTERS.priceMin ||
    appliedFilters.priceMax !== DEFAULT_FILTERS.priceMax;

  const renderProductResults = () => {
    if (loading) {
      return (
        <div className="glass-card rounded-[30px] px-6 py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--brand-primary)]" />
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            Loading the collection...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-[30px] border border-[#f0d7d2] bg-[#fff7f6] px-6 py-16 text-center shadow-card">
          <p className="text-lg font-medium text-[#7a352e]">Something went wrong</p>
          <p className="mt-2 text-sm text-[#9f5c57]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-[#7a352e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#662a24]"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="glass-card rounded-[30px] px-6 py-16 text-center">
          <p className="text-lg font-medium text-[var(--text-primary)]">
            No products found
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {searchTerm
              ? `We couldn't find anything matching "${searchTerm}". Try a different search term.`
              : "Try adjusting your filters to discover more products."}
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 rounded-full border border-[var(--border-soft)] px-5 py-2.5 text-sm font-medium text-[var(--brand-primary)] transition hover:bg-white"
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return (
      <div className="products-grid grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-7">
        {filteredProducts.map((product) => (
          <div key={product._id} className="h-full">
            <ProductCard product={product} variant="shop" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <section className="desktop-hero-section shop-hero border-b border-[var(--border-soft)] bg-[linear-gradient(180deg,#fbf6f1_0%,#f5ede5_100%)]">
        <div className="section-shell shop-hero-inner px-1 py-5 md:py-6">
          <span className="section-kicker shop-hero-kicker">Shop Ewara</span>
          <div className="shop-hero-content mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="shop-hero-copy max-w-[520px]">
              <h1 className="shop-hero-title font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                The complete collection
              </h1>
              <p className="shop-hero-description mt-0 text-sm leading-6 text-[var(--text-secondary)]">
                Explore Ewara&apos;s full edit of skincare, self-care, and
                beauty essentials in one calm, conversion-focused shopping
                space.
              </p>
            </div>

            <div className="shop-hero-stats glass-card grid gap-4 rounded-[28px] px-6 py-4 text-left sm:grid-cols-3 sm:gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Collection
                </p>
                <p className="shop-hero-stat-value mt-2 font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  {products.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Filtered
                </p>
                <p className="shop-hero-stat-value mt-2 font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  {filteredProducts.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Focus
                </p>
                <p className="shop-hero-stat-value mt-2 font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  Premium care
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mob-hero md:hidden">
        <div className="mob-hero-tag">Ewara Cosmetics</div>
        <div className="mob-hero-title">The complete collection</div>
        <div className="mob-hero-search">
          <Search className="h-3.5 w-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="mob-hero-search-input"
          />
        </div>
      </div>

      <div className="mobile-shop-shell section-shell px-1 py-10 md:py-12">
        <div className="mobile-shop-layout md:hidden">
          <div className="mobile-content-wrap">
            <div className="mob-chips">
              {categoryEntries.map((item) => (
                <span
                  key={item.value}
                  onClick={() => applyCategory(item.value)}
                  className={`mob-chip ${
                    draftFilters.category === item.value ? "active" : ""
                  } ${item.comingSoon ? "coming-soon" : ""}`}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div className="mob-toolbar">
              <span className="mob-count">{filteredProducts.length} products</span>
              <div className="mob-toolbar-btns">
                <details ref={mobileFilterSheetRef} className="mob-filter-sheet">
                  <summary className="mob-tbtn">
                    Filter
                  </summary>
                  <div className="mob-filter-panel">
                    <div className="mob-filter-group">
                      <p className="mob-filter-title">Skin Type</p>
                      {SKIN_TYPE_OPTIONS.map((option) => (
                        <label key={option} className="mob-filter-option">
                          <input
                            type="radio"
                            name="mobileSkinType"
                            value={option}
                            checked={draftFilters.skinType === option}
                            onChange={() => {
                              setDraftFilters((current) => ({
                                ...current,
                                skinType: option,
                              }));
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mob-filter-group">
                      <p className="mob-filter-title">Rating</p>
                      {RATING_OPTIONS.map((option) => {
                        const label =
                          option === "All" ? "All Ratings" : `${option}.0 & up`;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setDraftFilters((current) => ({
                                ...current,
                                rating: option,
                              }))
                            }
                            className={`mob-filter-chip ${
                              draftFilters.rating === option ? "active" : ""
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mob-filter-group">
                      <div className="flex items-center justify-between">
                        <p className="mob-filter-title">Price Range</p>
                        <span className="text-[11px] text-[#8a6e6e]">
                          Rs. {draftFilters.priceMin} - Rs. {draftFilters.priceMax}+
                        </span>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="125"
                          value={draftFilters.priceMin}
                          onChange={(e) => {
                            const nextValue = Math.min(
                              Number(e.target.value),
                              draftFilters.priceMax
                            );
                            setDraftFilters((current) => ({
                              ...current,
                              priceMin: nextValue,
                            }));
                          }}
                          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#eadfd5]"
                        />
                        <input
                          type="range"
                          min="0"
                          max="125"
                          value={draftFilters.priceMax}
                          onChange={(e) => {
                            const nextValue = Math.max(
                              Number(e.target.value),
                              draftFilters.priceMin
                            );
                            setDraftFilters((current) => ({
                              ...current,
                              priceMax: nextValue,
                            }));
                          }}
                          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#eadfd5]"
                        />
                      </div>
                    </div>

                    <div className="filter-actions">
                      <button
                        type="button"
                        onClick={applyFilters}
                        className="apply-filters-btn"
                      >
                        Apply Filters
                      </button>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="reset-filters-btn"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </details>

                <label className="mob-tbtn mob-sort-trigger">
                  Sort
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="mob-sort-select"
                    aria-label="Sort products"
                  >
                    <option value="newest">Featured</option>
                    <option value="rating-high">Top Rated</option>
                    <option value="reviews-high">Most Reviewed</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </label>
              </div>
            </div>

            {hasActiveFilters ? (
              <div className="mb-3 flex flex-wrap items-center gap-2 px-3 pt-3">
                {searchTerm.trim() ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    Search: {searchTerm.trim()}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {appliedFilters.category !== "All" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters((current) => ({
                        ...current,
                        category: DEFAULT_FILTERS.category,
                      }));
                      setDraftFilters((current) => ({
                        ...current,
                        category: DEFAULT_FILTERS.category,
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    {appliedFilters.category}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {appliedFilters.rating !== "All" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters((current) => ({
                        ...current,
                        rating: DEFAULT_FILTERS.rating,
                      }));
                      setDraftFilters((current) => ({
                        ...current,
                        rating: DEFAULT_FILTERS.rating,
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    {appliedFilters.rating}.0 & up
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="mobile-products-col">{renderProductResults()}</div>
          </div>

          <aside className="mobile-cat-drawer">
            {categoryEntries.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setDraftFilters((current) => ({
                    ...current,
                    category: item.value,
                  }))
                }
                className={`mob-cat-item ${
                  draftFilters.category === item.value ? "active" : ""
                }`}
              >
                {item.value === "All" ? "All" : item.value}
              </button>
            ))}
          </aside>
        </div>

        <div className="hidden flex-col gap-8 md:flex lg:flex-row lg:items-start">
          <aside className="desktop-filter-sidebar lg:sticky lg:top-28 lg:w-[280px] lg:flex-shrink-0">
            <div className="glass-card rounded-[30px] p-6">
              <div className="flex items-center gap-3 border-b border-[var(--border-soft)] pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(122,31,43,0.08)] text-[var(--brand-primary)]">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                    Filters
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Refine your shopping view
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--border-soft)] py-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Category
                </h2>
                <div className="mt-4 space-y-2">
                  {categoryEntries.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => applyCategory(item.value)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-sm transition ${
                      draftFilters.category === item.value
                        ? "bg-white text-[var(--brand-primary)] shadow-card"
                        : "text-[var(--text-secondary)] hover:bg-white/70"
                    } ${item.comingSoon ? "coming-soon" : ""}`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-[var(--surface-base)] px-2.5 py-0.5 text-[11px] text-[var(--text-muted)]">
                      {item.comingSoon ? "Soon" : item.count}
                    </span>
                  </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-[var(--border-soft)] py-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Skin Type
                </h2>
                <div className="mt-4 space-y-3">
                  {SKIN_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-secondary)]"
                    >
                      <input
                        type="radio"
                        name="skinType"
                        value={option}
                        checked={draftFilters.skinType === option}
                        onChange={() => {
                          setDraftFilters((current) => ({
                            ...current,
                            skinType: option,
                          }));
                        }}
                        className="h-4 w-4 border-[#d9c8b9] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-b border-[var(--border-soft)] py-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Rating
                </h2>
                <div className="mt-4 space-y-2">
                  {RATING_OPTIONS.map((option) => {
                    const label =
                      option === "All" ? "All Ratings" : `${option}.0 & up`;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setDraftFilters((current) => ({
                            ...current,
                            rating: option,
                          }))
                        }
                        className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-sm transition ${
                          draftFilters.rating === option
                            ? "bg-white text-[var(--brand-primary)] shadow-card"
                            : "text-[var(--text-secondary)] hover:bg-white/70"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Star
                            className={`h-3.5 w-3.5 ${
                              option === "All"
                                ? "text-[var(--text-muted)]"
                                : "fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                            }`}
                          />
                          <span>{label}</span>
                        </span>
                        {option !== "All" ? (
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {
                              products.filter(
                                (product) => product.rating >= Number(option)
                              ).length
                            }
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Price Range
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    Rs. {draftFilters.priceMin} - Rs. {draftFilters.priceMax}+
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="125"
                    value={draftFilters.priceMin}
                    onChange={(e) => {
                      const nextValue = Math.min(
                        Number(e.target.value),
                        draftFilters.priceMax
                      );
                      setDraftFilters((current) => ({
                        ...current,
                        priceMin: nextValue,
                      }));
                    }}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#eadfd5]"
                  />
                  <input
                    type="range"
                    min="0"
                    max="125"
                    value={draftFilters.priceMax}
                    onChange={(e) => {
                      const nextValue = Math.max(
                        Number(e.target.value),
                        draftFilters.priceMin
                      );
                      setDraftFilters((current) => ({
                        ...current,
                        priceMax: nextValue,
                      }));
                    }}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#eadfd5]"
                  />
                </div>

                <div className="filter-actions">
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="apply-filters-btn"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="reset-filters-btn"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="glass-card mb-6 flex flex-col gap-4 rounded-[30px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-1 flex-col gap-3 sm:max-w-xl">
                <p className="text-sm text-[var(--text-secondary)]">{resultSummary}</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-full border border-[var(--border-soft)] bg-white/80 py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition hover:border-[var(--brand-primary)]/25 focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/8"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="whitespace-nowrap">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none rounded-full border border-[var(--border-soft)] bg-white/80 py-3 pl-4 pr-10 text-sm text-[var(--text-primary)] outline-none transition hover:border-[var(--brand-primary)]/25 focus:border-[var(--brand-primary)]"
                  >
                    <option value="newest">Featured</option>
                    <option value="rating-high">Top Rated</option>
                    <option value="reviews-high">Most Reviewed</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
              </label>
            </div>

            {hasActiveFilters ? (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {searchTerm.trim() ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    Search: {searchTerm.trim()}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {appliedFilters.category !== "All" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters((current) => ({
                        ...current,
                        category: DEFAULT_FILTERS.category,
                      }));
                      setDraftFilters((current) => ({
                        ...current,
                        category: DEFAULT_FILTERS.category,
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    {appliedFilters.category}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {appliedFilters.rating !== "All" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters((current) => ({
                        ...current,
                        rating: DEFAULT_FILTERS.rating,
                      }));
                      setDraftFilters((current) => ({
                        ...current,
                        rating: DEFAULT_FILTERS.rating,
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    {appliedFilters.rating}.0 & up
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {appliedFilters.skinType !== "All Skin Types" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters((current) => ({
                        ...current,
                        skinType: DEFAULT_FILTERS.skinType,
                      }));
                      setDraftFilters((current) => ({
                        ...current,
                        skinType: DEFAULT_FILTERS.skinType,
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    {appliedFilters.skinType}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {appliedFilters.priceMin !== 0 || appliedFilters.priceMax !== 125 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFilters((current) => ({
                        ...current,
                        priceMin: DEFAULT_FILTERS.priceMin,
                        priceMax: DEFAULT_FILTERS.priceMax,
                      }));
                      setDraftFilters((current) => ({
                        ...current,
                        priceMin: DEFAULT_FILTERS.priceMin,
                        priceMax: DEFAULT_FILTERS.priceMax,
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs text-[var(--brand-primary)]"
                  >
                    Rs. {appliedFilters.priceMin} - Rs. {appliedFilters.priceMax}+
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ) : null}

            {renderProductResults()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .shop-hero-inner {
          padding-top: 24px;
          padding-bottom: 20px;
        }

        .shop-hero-kicker {
          margin-bottom: 8px;
        }

        .shop-hero-title {
          font-size: clamp(28px, 4vw, 42px);
          margin-bottom: 8px;
        }

        .shop-hero-description {
          font-size: 14px;
          margin-bottom: 0;
          max-width: 520px;
        }

        .shop-hero-stats {
          padding: 16px 24px;
          align-self: center;
        }

        .shop-hero-stat-value {
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .shop-hero {
            min-height: unset !important;
          }

          .shop-hero-inner {
            padding: 12px 16px !important;
            padding-top: 10px !important;
            padding-bottom: 10px !important;
          }

          .shop-hero-kicker {
            display: none !important;
          }

          .shop-hero-content {
            margin-top: 0 !important;
            gap: 0 !important;
          }

          .shop-hero-copy {
            max-width: none;
          }

          .shop-hero-title {
            font-size: 20px !important;
            margin-bottom: 4px !important;
          }

          .shop-hero-description {
            display: none !important;
          }

          .shop-hero-stats {
            display: none !important;
          }

          .desktop-hero-section {
            display: none !important;
          }

          .mob-hero {
            background: #7a1a2e;
            padding: 14px 14px 12px;
          }

          .mob-hero-tag {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.6);
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 3px;
          }

          .mob-hero-title {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
            font-family: Georgia, serif;
            margin-bottom: 10px;
            line-height: 1.2;
          }

          .mob-hero-search {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 18px;
            padding: 7px 12px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .mob-hero-search-input {
            width: 100%;
            background: transparent;
            color: #fff;
            border: none;
            outline: none;
            font-size: 11px;
          }

          .mob-hero-search-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .mobile-shop-layout {
            display: block;
            height: auto;
            overflow: visible;
            width: 100%;
          }

          .mobile-cat-drawer {
            display: none !important;
          }

          .mobile-shop-shell {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .mobile-content-wrap {
            min-width: 0;
            width: 100%;
          }

          .mob-chips {
            background: #fff;
            padding: 9px 12px;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            border-bottom: 0.5px solid #f0e0e0;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .mob-chips::-webkit-scrollbar {
            display: none;
          }

          .mob-chip {
            font-size: 11px;
            padding: 5px 14px;
            border-radius: 18px;
            border: 1px solid #e8d5d5;
            color: #555;
            white-space: nowrap;
            cursor: pointer;
            background: #fff;
            flex-shrink: 0;
          }

          .mob-chip.active {
            background: #7a1a2e;
            color: #fff;
            border-color: #7a1a2e;
            font-weight: 600;
          }

          .mob-chip.coming-soon,
          .mob-cat-item.coming-soon {
            opacity: 0.72;
            border-style: dashed;
          }

          .mob-cat-item.coming-soon {
            position: relative;
          }

          .mob-cat-item.coming-soon::after {
            content: "Coming Soon";
            display: block;
            margin-top: 3px;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #8a6e6e;
            text-transform: uppercase;
          }

          .mob-toolbar {
            background: #fff;
            padding: 7px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 0.5px solid #f0e0e0;
          }

          .mob-count {
            font-size: 11px;
            color: #888;
          }

          .mob-toolbar-btns {
            display: flex;
            gap: 6px;
          }

          .mob-filter-sheet {
            position: relative;
          }

          .mob-tbtn {
            position: relative;
            border: 1px solid #e8d5d5;
            background: #fff;
            color: #555;
            font-size: 11px;
            font-weight: 500;
            padding: 4px 12px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            list-style: none;
            cursor: pointer;
          }

          .mob-tbtn::-webkit-details-marker {
            display: none;
          }

          .mob-sort-trigger {
            overflow: hidden;
          }

          .mob-filter-panel {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            z-index: 30;
            border-radius: 18px;
            border: 1px solid #ead6d6;
            background: #fffaf8;
            padding: 14px;
            box-shadow: 0 18px 45px rgba(74, 32, 32, 0.18);
          }

          .mob-sort-select {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
          }

          .mob-filter-group + .mob-filter-group {
            margin-top: 14px;
          }

          .mob-filter-title {
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: 600;
            color: #7a1a2e;
          }

          .mob-filter-option {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #5c4747;
          }

          .mob-filter-option + .mob-filter-option {
            margin-top: 8px;
          }

          .mob-filter-chip {
            margin: 0 8px 8px 0;
            border-radius: 999px;
            border: 1px solid #ead6d6;
            background: #fff;
            padding: 6px 10px;
            font-size: 11px;
            color: #7a1a2e;
          }

          .mob-filter-chip.active {
            background: #fdf0f0;
            border-color: #7a1a2e;
          }

          .filter-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px 0 8px;
            border-top: 1px solid #f0e0e0;
            margin-top: 12px;
          }

          .apply-filters-btn {
            width: 100%;
            background: #7a1a2e;
            color: #fff;
            font-size: 13px;
            font-weight: 600;
            padding: 10px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
          }

          .reset-filters-btn {
            width: 100%;
            background: #fff;
            color: #7a1a2e;
            font-size: 13px;
            font-weight: 500;
            padding: 10px;
            border-radius: 10px;
            border: 1.5px solid #e8d5d5;
            cursor: pointer;
          }

          .mobile-products-col {
            overflow: visible;
            padding: 0;
            -webkit-overflow-scrolling: touch;
            width: 100%;
          }

          .desktop-filter-sidebar {
            display: none !important;
          }

          .products-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--brand-primary)]" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
