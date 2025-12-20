// features/products/components/SortSelect.tsx
"use client";

import { useProductsStore, SortOption } from "@/features/products/store/productsStore";

export function SortSelect() {
  const { sortBy, setSortBy } = useProductsStore();

  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as SortOption)}
      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
    >
      <option value="newest">جدیدترین</option>
      <option value="price-asc">ارزان‌ترین</option>
      <option value="price-desc">گران‌ترین</option>
      <option value="discount">بیشترین تخفیف</option>
    </select>
  );
}