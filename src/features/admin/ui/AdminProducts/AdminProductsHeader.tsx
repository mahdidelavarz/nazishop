'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';

interface AdminProductsHeaderProps {
  totalProducts: number;
}

export function AdminProductsHeader({ totalProducts }: AdminProductsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Icon icon="solar:box-bold-duotone" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                مدیریت محصولات
              </h1>
              <p className="text-gray-500 text-sm">
                {totalProducts.toLocaleString('fa-IR')} محصول در فروشگاه
              </p>
            </div>
          </div>
        </div>
        
        <Link
          href="/admin-products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105 active:scale-95"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          <span>محصول جدید</span>
        </Link>
      </div>
    </div>
  );
}

