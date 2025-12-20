// features/products/utils/discount.ts

export function calculateDiscount(
    price: number,
    originalPrice: number | null | undefined
  ): number {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }