// features/products/components/ProductInfo.tsx
"use client";

import { SingleProduct } from "@/features/products/types/productsType";
import { Icon } from "@iconify/react";
import AddToCartButton from "@/features/products/components/AddToCartBtn";
import { calculateDiscount } from "@/features/products/utils/discount";
import { formatPrice } from "@/features/products/utils/price";
import { StockStatus } from "./StockStatus";
import { ProductFeatures } from "./ProductFeatures";


interface ProductInfoProps {
  product: SingleProduct;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const discount = calculateDiscount(product.price, product.original_price);
  const savings =
    product.original_price && product.original_price > product.price
      ? product.original_price - product.price
      : 0;

  return (
    <div className="p-6 lg:p-8 flex flex-col">
      {/* Brand */}
      {product.brand && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Icon icon="ph:tag-duotone" width={18} />
          <span>{product.brand}</span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
        {product.title}
      </h1>

      {/* Description */}
      {product.description && (
        <p className="text-gray-700 leading-relaxed mb-6">
          {product.description}
        </p>
      )}

      {/* Price Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-extrabold text-pink-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-lg text-gray-700">تومان</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500 line-through text-lg">
              {formatPrice(product.original_price)} تومان
            </span>
            <span className="text-green-600 font-semibold">
              {formatPrice(savings)} تومان تخفیف
            </span>
          </div>
        )}
      </div>

      {/* Stock Status */}
      <div className="mb-6 pb-6 border-b">
        <StockStatus stock={product.stock} />
      </div>

      {/* Add to Cart */}
      <div className="mt-auto">
        <AddToCartButton product={product} stock={product.stock} />
      </div>

      {/* Features */}
      <ProductFeatures />
    </div>
  );
}