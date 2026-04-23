"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, type Product } from "@/utils/productApi";
import { Search, Filter } from "lucide-react";

// Default categories that must always exist
const DEFAULT_CATEGORIES = ["Skincare", "Haircare", "Makeup"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProducts();
        
        // Handle both response formats: { products: [...] } and direct array [...]
        const productsList = Array.isArray(data) ? data : (data.products || []);
        
        // Filter only published products
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

  // Build category list with default categories always present
  const buildCategories = (): string[] => {
    const dynamicCategories = new Set<string>(
      products.map(p => p.category).filter(Boolean)
    );
    
    // Combine default categories with dynamic ones, avoiding duplicates
    const allCategories = new Set<string>(DEFAULT_CATEGORIES);
    dynamicCategories.forEach(cat => allCategories.add(cat));
    
    // Return with "All" first
    return ["All", ...Array.from(allCategories).sort()];
  };

  const categories = buildCategories();

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === "price-low") {
        return a.price - b.price;
      } else if (sortOption === "price-high") {
        return b.price - a.price;
      } else if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#fdf8f6]">
      {/* Header Section */}
      <div className="border-b border-[#ead2d8] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#4a2c2a]">
                Shop Collection
              </h1>
              <p className="mt-3 text-base text-[#6b7280] max-w-2xl">
                Discover our carefully curated selection of premium beauty products. 
                From skincare essentials to luxurious cosmetics, find everything you need.
              </p>
            </div>
            <Filter className="hidden md:block h-8 w-8 text-[#7a1f2b] opacity-30" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        
        {/* Filter and Sort Controls */}
        <div className="mb-12">
          <div className="space-y-4 rounded-2xl border border-[#ead2d8] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Filter Label */}
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-[#7a1f2b]" />
              <h2 className="text-lg font-semibold text-[#4a2c2a]">Filters & Search</h2>
            </div>

            {/* Filter Grid */}
            <div className="grid gap-5 md:grid-cols-3">
              {/* Search Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-[#4a2c2a] mb-2.5">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9c8b87] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Find what you're looking for..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#ead2d8] bg-[#fffaf7] text-[#4a2c2a] placeholder-[#b5a9a4] outline-none transition-all duration-200 focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 hover:border-[#dfc4ca]"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-[#4a2c2a] mb-2.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#ead2d8] bg-[#fffaf7] text-[#4a2c2a] font-medium outline-none transition-all duration-200 focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 hover:border-[#dfc4ca] appearance-none cursor-pointer bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%227a1f2b%22><path fill-rule=%22evenodd%22 d=%22M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%22 clip-rule=%22evenodd%22/></svg>')] bg-[length:20px] bg-[right_0.5rem_center] bg-no-repeat pr-9"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#4a2c2a] mb-2.5">
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#ead2d8] bg-[#fffaf7] text-[#4a2c2a] font-medium outline-none transition-all duration-200 focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/10 hover:border-[#dfc4ca] appearance-none cursor-pointer bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%227a1f2b%22><path fill-rule=%22evenodd%22 d=%22M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%22 clip-rule=%22evenodd%22/></svg>')] bg-[length:20px] bg-[right_0.5rem_center] bg-no-repeat pr-9"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-[#ead2d8]">
              <p className="text-sm font-medium text-[#6b7280]">
                <span className="text-[#7a1f2b] font-semibold">{filteredProducts.length}</span> of <span className="text-[#7a1f2b] font-semibold">{products.length}</span> products
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs font-medium text-[#7a1f2b] hover:text-[#5c1721] transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        {loading ? (
          <div className="rounded-2xl border border-[#ead2d8] bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-[#ead2d8] border-t-[#7a1f2b] animate-spin" />
              <p className="text-base font-medium text-[#6b7280]">
                Loading our beautiful collection...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-red-700">Oops! Something went wrong</p>
                <p className="mt-2 text-red-600">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-[#ead2d8] bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#f7e7ea] flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <div>
                <p className="text-xl font-semibold text-[#4a2c2a]">
                  No products found
                </p>
                <p className="mt-2 text-[#6b7280]">
                  {searchTerm 
                    ? `We couldn't find anything matching "${searchTerm}". Try a different search term.`
                    : "Try adjusting your filters to discover more products."}
                </p>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2 rounded-lg bg-[#7a1f2b] text-white font-medium hover:bg-[#5c1721] transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div key={product._id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Results Info */}
            <div className="mt-12 text-center">
              <p className="text-sm text-[#6b7280]">
                Showing all {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}