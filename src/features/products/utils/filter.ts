// features/products/utils/filter.ts

import { ProductListItem } from "@/features/products/types/productsType";

interface FilterOptions {
  searchQuery: string;
  priceRange: [number, number];
  selectedBrands: string[];
  showInStock: boolean;
  showWithDiscount: boolean;
}

export function filterProducts(
  products: ProductListItem[],
  options: FilterOptions
): ProductListItem[] {
  let filtered = [...products];

  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
    );
  }

  filtered = filtered.filter((p) => {
    const price = p.price ?? 0;
    return price >= options.priceRange[0] && price <= options.priceRange[1];
  });

  if (options.selectedBrands.length > 0) {
    filtered = filtered.filter(
      (p) => p.brand && options.selectedBrands.includes(p.brand)
    );
  }

  if (options.showInStock) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  if (options.showWithDiscount) {
    filtered = filtered.filter(
      (p) => p.original_price && p.original_price > p.price
    );
  }

  return filtered;
}