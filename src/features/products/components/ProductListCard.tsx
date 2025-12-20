// features/products/components/ProductListCard.tsx
"use client";

import Link from "next/link";
import { ProductListItem } from "@/features/products/types/productsType";
import { ProductImage } from "./ProductImage";
import { calculateDiscount } from "../utils/discount";
import { formatPrice } from "../utils/price";

interface ProductListCardProps {
  product: ProductListItem;
}

export function ProductListCard({ product }: ProductListCardProps) {
  const discount = calculateDiscount(product.price, product.original_price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition group"
    >
      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
        <ProductImage
          src={product.thumbnail_url}
          alt={product.title}
          fill
          sizes="128px"
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-pink-600">
          {product.title}
        </h3>
        
        {product.brand && (
          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
        )}

        <div className="flex items-center gap-4">
          <div>
            <span className="font-bold text-pink-600">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through mr-2">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
              {discount}% تخفیف
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}