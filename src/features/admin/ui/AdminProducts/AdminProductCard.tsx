'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { AdminProductListItem } from '../../types/adminProduct.types';
import { normalizeImageUrl } from '@/features/products/utils/image';

interface AdminProductCardProps {
  product: AdminProductListItem;
  onDelete?: (id: string) => void;
}

export function AdminProductCard({ product, onDelete }: AdminProductCardProps) {
  const imageUrl = normalizeImageUrl(product.thumbnail_url);
  const hasDiscount = product.discount_percent && product.discount_percent > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="solar:box-bold-duotone" className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {!product.is_public && (
            <span className="px-2 py-1 bg-gray-800/80 backdrop-blur-sm text-white text-xs rounded-lg font-medium">
              مخفی
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-medium">
              {product.discount_percent}% تخفیف
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute bottom-3 right-3">
          {product.stock === 0 ? (
            <span className="px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-lg font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              ناموجود
            </span>
          ) : product.stock <= 10 ? (
            <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs rounded-lg font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {product.stock} عدد
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs rounded-lg font-medium">
              {product.stock} عدد
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/admin-products/${product.slug}/edit`}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors"
          >
            <Icon icon="solar:pen-bold-duotone" className="w-5 h-5 text-blue-600" />
          </Link>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-green-50 transition-colors"
          >
            <Icon icon="solar:eye-bold-duotone" className="w-5 h-5 text-green-600" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}
        
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
          {product.title}
        </h3>

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-400 font-mono mb-2">SKU: {product.sku}</p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-pink-600">
            {product.price.toLocaleString('fa-IR')}
          </span>
          <span className="text-xs text-gray-500">تومان</span>
          {hasDiscount && product.original_price && (
            <span className="text-sm text-gray-400 line-through">
              {product.original_price.toLocaleString('fa-IR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

