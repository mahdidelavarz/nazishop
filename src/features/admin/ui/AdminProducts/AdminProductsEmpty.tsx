'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';

export function AdminProductsEmpty() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="solar:box-bold-duotone" className="w-12 h-12 text-pink-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          هنوز محصولی اضافه نشده است
        </h3>
        <p className="text-gray-500 mb-6">
          اولین محصول خود را اضافه کنید و شروع به فروش کنید
        </p>
        <Link
          href="/admin-products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/30"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          افزودن اولین محصول
        </Link>
      </div>
    </div>
  );
}

