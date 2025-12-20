// features/products/utils/product.ts

import { SingleProduct } from "@/features/products/types/productsType";
import { normalizeImageUrl } from "./image";

export function getProductImages(product: SingleProduct): string[] {
  const images: string[] = [];

  // Get images from product_details
  if (product.product_details?.images && Array.isArray(product.product_details.images)) {
    product.product_details.images.forEach((img) => {
      const normalized = normalizeImageUrl(img);
      if (normalized) {
        images.push(normalized);
      }
    });
  }

  // Add thumbnail as fallback
  if (images.length === 0 && product.thumbnail_url) {
    const normalized = normalizeImageUrl(product.thumbnail_url);
    if (normalized) {
      images.push(normalized);
    }
  }

  // Return at least one placeholder if no images
  return images.length > 0 ? images : [];
}