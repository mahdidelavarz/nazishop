// features/products/components/ProductImage.tsx
"use client";

import Image, { ImageProps } from "next/image";
import { Icon } from "@iconify/react";
import { normalizeImageUrl, shouldUnoptimize } from "../utils/image";


interface ProductImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  alt: string;
}

export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const imageUrl = normalizeImageUrl(src);

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Icon icon="ph:image-duotone" className="text-gray-300" width={48} />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      unoptimized={shouldUnoptimize(imageUrl)}
      {...props}
    />
  );
}