'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { AdminProductListItem } from '../../types/adminProduct.types';
import { normalizeImageUrl } from '@/features/products/utils/image';

interface AdminProductsTableProps {
  products: AdminProductListItem[];
  onDelete?: (id: string) => void;
}

export function AdminProductsTable({ products, onDelete }: AdminProductsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                محصول
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                برند
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                قیمت
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                موجودی
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                وضعیت
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                اقدامات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <AdminProductRow 
                key={product.id} 
                product={product} 
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AdminProductRowProps {
  product: AdminProductListItem;
  onDelete?: (id: string) => void;
}

function AdminProductRow({ product, onDelete }: AdminProductRowProps) {
  const imageUrl = normalizeImageUrl(product.thumbnail_url);
  const hasDiscount = product.discount_percent && product.discount_percent > 0;

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      {/* Product */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon icon="solar:box-bold-duotone" className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate max-w-[200px]">
              {product.title}
            </p>
            <p className="text-xs text-gray-500 font-mono truncate">
              {product.slug}
            </p>
          </div>
        </div>
      </td>

      {/* Brand */}
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="text-gray-700">{product.brand || '-'}</span>
      </td>

      {/* Price */}
      <td className="px-6 py-4">
        <div>
          <span className="font-semibold text-gray-900">
            {product.price.toLocaleString('fa-IR')}
          </span>
          <span className="text-xs text-gray-500 mr-1">تومان</span>
          {hasDiscount && (
            <span className="block text-xs text-green-600 font-medium">
              {product.discount_percent}% تخفیف
            </span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="px-6 py-4 hidden sm:table-cell">
        <span className={`font-medium ${product.stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
          {product.stock.toLocaleString('fa-IR')}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="flex flex-col gap-1">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              موجود
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 w-fit">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              ناموجود
            </span>
          )}
          {!product.is_public && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 w-fit">
              <Icon icon="solar:eye-closed-bold" className="w-3 h-3" />
              مخفی
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin-products/${product.slug}/edit`}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
            title="ویرایش"
          >
            <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
          </Link>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
            title="مشاهده"
          >
            <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              title="حذف"
            >
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

