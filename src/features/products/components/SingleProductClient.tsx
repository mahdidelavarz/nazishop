// features/products/components/SingleProductClient.tsx
"use client";

import { SingleProduct } from "@/features/products/types/productsType";
import { ProductBreadcrumb } from "./ProductBreadCrump";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDetails } from "./ProductDetails";

interface SingleProductClientProps {
  product: SingleProduct;
}

export function SingleProductClient({ product }: SingleProductClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <ProductBreadcrumb productTitle={product.title} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <ProductImageGallery product={product} />
          <ProductInfo product={product} />
        </div>

        {/* Product Details & Specifications */}
        {product.product_details && (
          <ProductDetails details={product.product_details} />
        )}
      </div>
    </div>
  );
}