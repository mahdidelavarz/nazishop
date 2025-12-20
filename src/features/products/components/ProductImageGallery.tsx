// features/products/components/ProductImageGallery.tsx
"use client";

import { useState } from "react";
import { SingleProduct } from "@/features/products/types/productsType";
import { ProductImage } from "./ProductImage";
import { ProductBadges } from "./ProductBadges";
import WishlistHeartButton from "@/features/wishlist/components/WishlistHeartButton";
import { getProductImages } from "@/features/products/utils/product";

interface ProductImageGalleryProps {
  product: SingleProduct;
}

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const images = getProductImages(product);
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="p-6 lg:p-8">
      <div className="relative mb-4">
        <ProductBadges product={product} />

        <div className="absolute top-4 right-4 z-10">
          <WishlistHeartButton productId={product.id} />
        </div>

        {/* Main Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <ProductImage
            src={images[activeImage]}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                activeImage === i
                  ? "border-pink-500"
                  : "border-gray-200 hover:border-pink-300"
              }`}
            >
              <ProductImage
                src={img}
                alt={`${product.title} - تصویر ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}