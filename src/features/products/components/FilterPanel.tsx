// features/products/components/FilterPanel.tsx
"use client";

import { useProductsStore } from "@/features/products/store/productsStore";

interface FilterPanelProps {
  brands: string[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function FilterPanel({
  brands,
  onClearFilters,
  activeFiltersCount,
}: FilterPanelProps) {
  const {
    selectedBrands,
    showInStock,
    showWithDiscount,
    toggleBrand,
    setShowInStock,
    setShowWithDiscount,
  } = useProductsStore();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">فیلترها</h3>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-pink-500 hover:text-pink-600 font-medium transition"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="space-y-3 mb-6 pb-6 border-b">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showInStock}
              onChange={(e) => setShowInStock(e.target.checked)}
              className="w-4 h-4 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
            />
            <span className="text-sm group-hover:text-pink-600 transition">
              فقط موجود
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showWithDiscount}
              onChange={(e) => setShowWithDiscount(e.target.checked)}
              className="w-4 h-4 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
            />
            <span className="text-sm group-hover:text-pink-600 transition">
              دارای تخفیف
            </span>
          </label>
        </div>

        {/* Brands Filter */}
        {brands.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-800">برند</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-sm group-hover:text-pink-600 transition">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}