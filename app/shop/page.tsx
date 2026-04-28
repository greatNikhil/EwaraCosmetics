"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, type Product } from "@/utils/productApi";
import { ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";

const DEFAULT_CATEGORIES = ["Skincare", "Haircare", "Makeup"];
const SKIN_TYPE_OPTIONS = [
  "All Skin Types",
  "Dry",
  "Oily",
  "Combination",
];
const RATING_OPTIONS = ["All", "4", "3", "2"];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedSkinType, setSelectedSkinType] = useState("All Skin Types");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(125);
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
      } catch (error) {
        console.error("Error fetching shop products:", error);
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
      label: category === "All" ? "All Products" : category,
      value: category,
      count:
        category === "All"
          ? products.length
          : products.filter((product) => product.category === category).length,
    }));
  }, [categories, products]);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesRating =
        selectedRating === "All" || product.rating >= Number(selectedRating);

      const matchesPrice =
        product.price >= priceMin &&
        (priceMax >= 125 ? true : product.price <= priceMax);

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedRating("All");
    setSelectedSkinType("All Skin Types");
    setPriceMin(0);
    setPriceMax(125);
  };

  const resultSummary =
    filteredProducts.length > 0
      ? `Showing 1-${filteredProducts.length} of ${products.length} products`
      : `Showing 0 of ${products.length} products`;

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedRating !== "All" ||
    selectedSkinType !== "All Skin Types" ||
    priceMin !== 0 ||
    priceMax !== 125;

  return (
    <div className="min-h-screen bg-[#fcf8f3]">
      <div className="border-b border-[#ece1d7] bg-[#f8f1e8]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8f7a68]">
            Shop
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.02em] text-[#30231d] md:text-5xl">
            The Complete Collection
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7b6c61] md:text-base">
            Explore Ewara&apos;s full edit of skincare, self-care, and beauty
            essentials in one calm, considered space.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="lg:sticky lg:top-28 lg:w-[220px] lg:flex-shrink-0">
            <div className="rounded-[22px] border border-[#eadfd5] bg-white p-5 shadow-[0_10px_35px_rgba(53,39,28,0.05)]">
              <div className="flex items-center gap-2 border-b border-[#f1e8de] pb-4">
                <SlidersHorizontal className="h-4 w-4 text-[#7b5b45]" />
                <p className="text-sm font-medium text-[#30231d]">Filters</p>
              </div>

              <div className="border-b border-[#f1e8de] py-5">
                <h2 className="text-sm font-medium text-[#30231d]">Category</h2>
                <div className="mt-4 space-y-2">
                  {categoryEntries.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedCategory(item.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                        selectedCategory === item.value
                          ? "bg-[#f6efe7] text-[#6a4a36]"
                          : "text-[#75675d] hover:bg-[#fbf7f2]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] text-[#9a8778]">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-[#f1e8de] py-5">
                <h2 className="text-sm font-medium text-[#30231d]">Skin Type</h2>
                <div className="mt-4 space-y-3">
                  {SKIN_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-3 text-sm text-[#75675d]"
                    >
                      <input
                        type="radio"
                        name="skinType"
                        value={option}
                        checked={selectedSkinType === option}
                        onChange={() => {
                          // TODO: Hook this UI into a real skin type filter when data becomes available.
                          setSelectedSkinType(option);
                        }}
                        className="h-4 w-4 border-[#d9c8b9] text-[#7b5b45] focus:ring-[#7b5b45]/20"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-b border-[#f1e8de] py-5">
                <h2 className="text-sm font-medium text-[#30231d]">Rating</h2>
                <div className="mt-4 space-y-2">
                  {RATING_OPTIONS.map((option) => {
                    const label =
                      option === "All" ? "All Ratings" : `${option}.0 & up`;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedRating(option)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                          selectedRating === option
                            ? "bg-[#f6efe7] text-[#6a4a36]"
                            : "text-[#75675d] hover:bg-[#fbf7f2]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Star
                            className={`h-3.5 w-3.5 ${
                              option === "All"
                                ? "text-[#b8a69a]"
                                : "fill-[#7b5b45] text-[#7b5b45]"
                            }`}
                          />
                          <span>{label}</span>
                        </span>
                        {option !== "All" ? (
                          <span className="text-[11px] text-[#9a8778]">
                            {products.filter((product) => product.rating >= Number(option)).length}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-[#30231d]">
                    Price Range
                  </h2>
                  <span className="text-xs text-[#8f7a68]">
                    ${priceMin} - ${priceMax}+
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="125"
                    value={priceMin}
                    onChange={(e) => {
                      const nextValue = Math.min(Number(e.target.value), priceMax);
                      setPriceMin(nextValue);
                    }}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#eadfd5]"
                  />
                  <input
                    type="range"
                    min="0"
                    max="125"
                    value={priceMax}
                    onChange={(e) => {
                      const nextValue = Math.max(Number(e.target.value), priceMin);
                      setPriceMax(nextValue);
                    }}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#eadfd5]"
                  />
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-[#7b5b45] transition hover:text-[#5c4332]"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 rounded-[22px] border border-[#eadfd5] bg-white px-5 py-4 shadow-[0_10px_35px_rgba(53,39,28,0.05)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:max-w-xl">
                <p className="text-sm text-[#75675d]">{resultSummary}</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b897d]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-full border border-[#e7dbcf] bg-[#fcf8f3] py-2.5 pl-10 pr-4 text-sm text-[#30231d] outline-none transition hover:border-[#d8c7b6] focus:border-[#7b5b45]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-[#75675d]">
                <span className="whitespace-nowrap">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none rounded-full border border-[#e7dbcf] bg-[#fcf8f3] py-2 pl-4 pr-10 text-sm text-[#30231d] outline-none transition hover:border-[#d8c7b6] focus:border-[#7b5b45]"
                  >
                    <option value="newest">Featured</option>
                    <option value="rating-high">Top Rated</option>
                    <option value="reviews-high">Most Reviewed</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7a68]" />
                </div>
              </label>
            </div>

            {hasActiveFilters ? (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {searchTerm.trim() ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e7dbcf] bg-white px-3 py-1.5 text-xs text-[#6a4a36]"
                  >
                    Search: {searchTerm.trim()}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {selectedCategory !== "All" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e7dbcf] bg-white px-3 py-1.5 text-xs text-[#6a4a36]"
                  >
                    {selectedCategory}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {selectedRating !== "All" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedRating("All")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e7dbcf] bg-white px-3 py-1.5 text-xs text-[#6a4a36]"
                  >
                    {selectedRating}.0 & up
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {selectedSkinType !== "All Skin Types" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedSkinType("All Skin Types")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e7dbcf] bg-white px-3 py-1.5 text-xs text-[#6a4a36]"
                  >
                    {selectedSkinType}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {(priceMin !== 0 || priceMax !== 125) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPriceMin(0);
                      setPriceMax(125);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e7dbcf] bg-white px-3 py-1.5 text-xs text-[#6a4a36]"
                  >
                    ${priceMin} - ${priceMax}+
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-[24px] border border-[#eadfd5] bg-white px-6 py-16 text-center shadow-[0_10px_35px_rgba(53,39,28,0.05)]">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadfd5] border-t-[#7b5b45]" />
                <p className="mt-5 text-sm text-[#75675d]">
                  Loading the collection...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[24px] border border-[#f0d7d2] bg-[#fff7f6] px-6 py-16 text-center shadow-[0_10px_35px_rgba(53,39,28,0.05)]">
                <p className="text-lg font-medium text-[#7a352e]">
                  Something went wrong
                </p>
                <p className="mt-2 text-sm text-[#9f5c57]">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-full bg-[#7a352e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#662a24]"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[24px] border border-[#eadfd5] bg-white px-6 py-16 text-center shadow-[0_10px_35px_rgba(53,39,28,0.05)]">
                <p className="text-lg font-medium text-[#30231d]">
                  No products found
                </p>
                <p className="mt-2 text-sm text-[#75675d]">
                  {searchTerm
                    ? `We couldn't find anything matching "${searchTerm}". Try a different search term.`
                    : "Try adjusting your filters to discover more products."}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-full border border-[#d8c7b6] px-5 py-2.5 text-sm font-medium text-[#7b5b45] transition hover:bg-[#fbf7f2]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
