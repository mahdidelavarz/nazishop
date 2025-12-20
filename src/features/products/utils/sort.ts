// features/products/utils/sort.ts

import { ProductListItem } from "@/features/products/types/productsType";
import { SortOption } from "@/features/products/store/productsStore";
import { calculateDiscount } from "../utils/discount";

export function sortProducts(
  products: ProductListItem[],
  sortBy: SortOption
): ProductListItem[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);

    case "discount":
      return sorted.sort((a, b) => {
        const discountA = calculateDiscount(a.price, a.original_price);
        const discountB = calculateDiscount(b.price, b.original_price);
        return discountB - discountA;
      });

    case "newest":
    default:
      return sorted;
  }
}