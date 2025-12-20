// features/products/components/ProductCard.tsx
"use client";

import Link from "next/link";
import { ProductListItem } from "@/features/products/types/productsType";
import { ProductImage } from "./ProductImage";

import WishlistHeartButton from "@/features/wishlist/components/WishlistHeartButton";
import { Icon } from "@iconify/react";
import { ProductBadges } from "./ProductBadges";
import { ProductPrice } from "./ProductPrice";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
    >
      <ProductBadges product={product} />

      <div className="absolute top-2 right-2 z-10">
        <WishlistHeartButton productId={product.id} />
      </div>

      <div
        className={`relative w-full aspect-[3/4] overflow-hidden bg-gray-100 ${
          isOutOfStock ? "opacity-60" : ""
        }`}
      >
        <ProductImage
          src={product.thumbnail_url}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col p-4 flex-1">
        {product.brand && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Icon icon="ph:tag-duotone" width={14} />
            <span>{product.brand}</span>
          </div>
        )}

        <h2 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-pink-600 transition-colors">
          {product.title}
        </h2>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <ProductPrice
            price={product.price}
            originalPrice={product.original_price}
          />
        </div>
      </div>
    </Link>
  );
}