// app/products/ProductsClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Product } from "@/features/products/types/productsType";
import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  SortOption,
  ViewMode,
  useProductsStore,
} from "@/features/products/store/productsStore";

interface ProductsClientProps {
  initialProducts: Product[];
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [products] = useState<Product[]>(initialProducts);

  const {
    sortBy,
    viewMode,
    priceRange,
    selectedBrands,
    showInStock,
    showWithDiscount,
    setSortBy,
    setViewMode,
    setPriceRange,
    toggleBrand,
    setShowInStock,
    setShowWithDiscount,
    clearFilters,
  } = useProductsStore();

  const [showFilters, setShowFilters] = useState(false);

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(brandSet) as string[];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(
        (p) => p.brand && selectedBrands.includes(p.brand)
      );
    }

    // Filter by stock
    if (showInStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Filter by discount
    if (showWithDiscount) {
      filtered = filtered.filter(
        (p) => p.original_price && p.original_price > p.price
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        filtered.sort((a, b) => {
          const discountA = a.original_price
            ? ((a.original_price - a.price) / a.original_price) * 100
            : 0;
          const discountB = b.original_price
            ? ((b.original_price - b.price) / b.original_price) * 100
            : 0;
          return discountB - discountA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [
    products,
    priceRange,
    selectedBrands,
    showInStock,
    showWithDiscount,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">محصولات فروشگاه</h1>
              <p className="text-gray-600 text-sm">
                {filteredProducts.length} از {products.length} محصول
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

          {/* Controls Bar */}
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
              {(selectedBrands.length > 0 || showInStock || showWithDiscount) && (
                <span className="bg-white text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {selectedBrands.length +
                    (showInStock ? 1 : 0) +
                    (showWithDiscount ? 1 : 0)}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <option value="newest">جدیدترین</option>
              <option value="price-asc">ارزان‌ترین</option>
              <option value="price-desc">گران‌ترین</option>
              <option value="discount">بیشترین تخفیف</option>
            </select>

            <div className="mr-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 border rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-pink-100 border-pink-500 text-pink-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon icon="ph:squares-four-duotone" width={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 border rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-pink-100 border-pink-500 text-pink-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon icon="ph:list-duotone" width={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">فیلترها</h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-pink-500 hover:text-pink-600"
                  >
                    پاک کردن
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInStock}
                      onChange={(e) => setShowInStock(e.target.checked)}
                      className="w-4 h-4 text-pink-500 rounded"
                    />
                    <span className="text-sm">فقط موجود</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWithDiscount}
                      onChange={(e) => setShowWithDiscount(e.target.checked)}
                      className="w-4 h-4 text-pink-500 rounded"
                    />
                    <span className="text-sm">دارای تخفیف</span>
                  </label>
                </div>

                {/* Brands Filter */}
                {brands.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3">برند</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-pink-500 rounded"
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:package-duotone" className="text-gray-400" width={64} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">محصولی یافت نشد</h3>
                <p className="text-gray-600 mb-4">فیلترهای خود را تغییر دهید</p>
                <button
                  onClick={clearFilters}
                  className="text-pink-500 hover:text-pink-600 font-medium"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => {
                  const discount =
                    product.original_price && product.original_price > product.price
                      ? Math.round(
                          ((product.original_price - product.price) /
                            product.original_price) *
                            100
                        )
                      : 0;

                  const isOutOfStock = product.stock === 0;

                  if (viewMode === "list") {
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="flex gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition group"
                      >
                        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {product.thumbnail_url ? (
                            <img
                              src={
                                product.thumbnail_url.startsWith("/")
                                  ? product.thumbnail_url
                                  : `/${product.thumbnail_url}`
                              }
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon icon="ph:image-duotone" className="text-gray-300" width={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1 group-hover:text-pink-600">
                            {product.title}
                          </h3>
                          {product.brand && (
                            <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="font-bold text-pink-600">
                                {product.price.toLocaleString()} تومان
                              </span>
                              {discount > 0 && (
                                <span className="text-xs text-gray-400 line-through mr-2">
                                  {product.original_price?.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {discount > 0 && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                                {discount}% تخفیف
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  // Grid view (same as before)
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                    >
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                        {discount > 0 && (
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Icon icon="ph:percent-duotone" width={14} />
                            {discount}%
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            ناموجود
                          </div>
                        )}
                      </div>

                      <div
                        className={`relative w-full aspect-[3/4] overflow-hidden bg-gray-100 ${
                          isOutOfStock ? "opacity-60" : ""
                        }`}
                      >
                        {product.thumbnail_url ? (
                          <img
                            src={
                              product.thumbnail_url.startsWith("/")
                                ? product.thumbnail_url
                                : `/${product.thumbnail_url}`
                            }
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon icon="ph:image-duotone" className="text-gray-300" width={48} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col p-4 flex-1">
                        {product.brand && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <Icon icon="ph:tag-duotone" width={14} />
                            <span>{product.brand}</span>
                          </div>
                        )}

                        <h2 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-pink-600 transition-colors">
                          {product.title}
                        </h2>

                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-pink-600">
                              {product.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-800">تومان</span>
                          </div>
                          {discount > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                              {product.original_price?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}