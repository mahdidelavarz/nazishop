// features/products/components/ViewToggle.tsx
"use client";

import { Icon } from "@iconify/react";
import { useProductsStore } from "@/features/products/store/productsStore";

export function ViewToggle() {
  const { viewMode, setViewMode } = useProductsStore();

  return (
    <div className="mr-auto flex items-center gap-2">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 border rounded-lg transition ${
          viewMode === "grid"
            ? "bg-pink-100 border-pink-500 text-pink-600"
            : "border-gray-300 hover:bg-gray-50"
        }`}
        aria-label="Grid view"
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
        aria-label="List view"
      >
        <Icon icon="ph:list-duotone" width={20} />
      </button>
    </div>
  );
}