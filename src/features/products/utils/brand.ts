// features/products/utils/brands.ts

import { ProductListItem } from "@/features/products/types/productsType";

export function extractBrands(products: ProductListItem[]): string[] {
  const brandSet = new Set(products.map((p) => p.brand).filter(Boolean));
  return Array.from(brandSet).sort() as string[];
}