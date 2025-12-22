// features/products/components/ProductsClient.tsx
"use client";

import { useState, useMemo } from "react";
import { ProductListItem } from "@/features/products/types/productsType";
import { ProductGrid } from "./ProductGrid";
import { useProductsStore } from "../store/productsStore";
import { filterProducts } from "../utils/filter";
import { sortProducts } from "../utils/sort";
import { extractBrands } from "../utils/brand";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { SearchBar } from "./SearchBar";
import { SortSelect } from "./SortSelect";
import { ViewToggle } from "./viewToggle";
import { FilterPanel } from "./FilterPanel";

interface ProductsClientProps {
  initialProducts: ProductListItem[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const {
    sortBy,
    viewMode,
    priceRange,
    selectedBrands,
    showInStock,
    showWithDiscount,
    clearFilters,
  } = useProductsStore();

  const brands = useMemo(() => extractBrands(initialProducts), [initialProducts]);

  const filteredProducts = useMemo(() => {
    let products = filterProducts(initialProducts, {
      searchQuery,
      priceRange,
      selectedBrands,
      showInStock,
      showWithDiscount,
    });

    products = sortProducts(products, sortBy);

    return products;
  }, [
    initialProducts,
    searchQuery,
    priceRange,
    selectedBrands,
    showInStock,
    showWithDiscount,
    sortBy,
  ]);

  const isPriceRangeDefault = 
    priceRange[0] === 0 && priceRange[1] === 1_000_000_000;

  const activeFiltersCount =
    selectedBrands.length +
    (showInStock ? 1 : 0) +
    (showWithDiscount ? 1 : 0) +
    (!isPriceRangeDefault ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                محصولات فروشگاه
              </h1>
              <p className="text-gray-600 text-sm">
                {filteredProducts.length} از {initialProducts.length} محصول
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition"
            >
              <Icon icon="ph:house-duotone" width={20} />
              <span className="hidden sm:inline">بازگشت به خانه</span>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                showFilters
                  ? "bg-pink-500 text-white"
                  : "bg-pink-100 text-pink-600 hover:bg-pink-200"
              }`}
            >
              <Icon icon="ph:funnel-duotone" width={18} />
              <span className="text-sm font-medium">فیلترها</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <SortSelect />

            <ViewToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <FilterPanel
              brands={brands}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="ph:package-duotone"
                    className="text-gray-400"
                    width={64}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  محصولی یافت نشد
                </h3>
                <p className="text-gray-600 mb-4">
                  فیلترهای خود را تغییر دهید
                </p>
                <button
                  onClick={clearFilters}
                  className="text-pink-500 hover:text-pink-600 font-medium"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}