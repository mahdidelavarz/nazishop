// features/products/components/ProductPrice.tsx
"use client";

import { formatPrice } from "@/features/products/utils/price";
import { calculateDiscount } from "@/features/products/utils/discount";

interface ProductPriceProps {
  price: number;
  originalPrice: number | null;
  showLabel?: boolean;
}

export function ProductPrice({ price, originalPrice, showLabel = true }: ProductPriceProps) {
  const discount = calculateDiscount(price, originalPrice);

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-pink-600">{formatPrice(price)}</span>
        {showLabel && <span className="text-xs text-gray-800">تومان</span>}
      </div>
      {discount > 0 && (
        <span className="text-xs text-gray-400 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}