// features/products/utils/price.ts

export function formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) return "۰";
    return price.toLocaleString("fa-IR");
  }