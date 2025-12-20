// features/products/components/ProductBadges.tsx
"use client";

import { Icon } from "@iconify/react";
import { ProductListItem, SingleProduct } from "@/features/products/types/productsType";
import { calculateDiscount } from "@/features/products/utils/discount";

interface ProductBadgesProps {
  product: ProductListItem | SingleProduct;
}

export function ProductBadges({ product }: ProductBadgesProps) {
  const discount = calculateDiscount(product.price, product.original_price);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
      {discount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg flex items-center gap-1 sm:gap-2">
          <Icon icon="ph:percent-duotone" width={14} />
          {discount}% تخفیف
        </div>
      )}
      {isOutOfStock && (
        <div className="bg-gray-800 text-white text-xs sm:text-sm font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg">
          ناموجود
        </div>
      )}
    </div>
  );
}