"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, type Product } from "@/utils/productApi";

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
    <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#4a2c2a]">Shop</h1>
          <p className="mt-2 text-[#6b7280]">
            Explore our latest beauty collection.
          </p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-8 rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-semibold text-[#4a2c2a] mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 text-[#4a2c2a] placeholder-[#9c8b87] outline-none focus:border-[#7a1f2b] focus:ring-1 focus:ring-[#7a1f2b]"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#4a2c2a] mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 text-[#4a2c2a] outline-none focus:border-[#7a1f2b] focus:ring-1 focus:ring-[#7a1f2b]"
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
              <label className="block text-sm font-semibold text-[#4a2c2a] mb-2">
                Sort By
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 text-[#4a2c2a] outline-none focus:border-[#7a1f2b] focus:ring-1 focus:ring-[#7a1f2b]"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="mt-4 text-sm text-[#6b7280]">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#7a1f2b]">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-red-600">Error</p>
            <p className="mt-3 text-[#6b7280]">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#ead2d8] bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-[#7a1f2b]">
              No products found.
            </p>
            <p className="mt-3 text-[#6b7280]">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}