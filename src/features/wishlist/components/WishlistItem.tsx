"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { WishlistItem as WishlistItemType } from "../types/wishlistTypes";
import { useRemoveFromWishlist } from "../hooks/useWishlist";

interface WishlistItemProps {
  item: WishlistItemType;
}

export default function WishlistItem({ item }: WishlistItemProps) {
  const { mutate: removeFromWishlist, isPending } = useRemoveFromWishlist();

  const handleRemove = () => {
    if (!item.product_id) return;
    removeFromWishlist(item.product_id);
  };

  const product = item.product;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition p-4 flex gap-4">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-neutral-100 hover:opacity-80 transition"
      >
        {product.thumbnail_url ? (
          <Image
            src={
              product.thumbnail_url.startsWith("/")
                ? product.thumbnail_url
                : `/${product.thumbnail_url}`
            }
            alt={product.title}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="ph:image-duotone" className="text-neutral-300" width={32} />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-foreground hover:text-accent-500 transition line-clamp-2 mb-1"
          >
            {product.title}
          </Link>

          {product.brand && (
            <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
              <Icon icon="ph:tag-duotone" width={14} />
              <span>{product.brand}</span>
            </p>
          )}

          <p className="text-sm text-neutral-600 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-primary-600">
              {product.price.toLocaleString()} تومان
            </p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-xs text-neutral-400 line-through">
                {product.original_price.toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={handleRemove}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-error/20 text-error hover:bg-error/5 text-sm transition disabled:opacity-50"
          >
            <Icon icon="ph:trash-duotone" width={16} />
            <span>حذف</span>
          </button>
        </div>
      </div>
    </div>
  );
}


