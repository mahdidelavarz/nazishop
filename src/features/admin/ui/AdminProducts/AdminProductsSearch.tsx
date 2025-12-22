'use client';

import { Icon } from '@iconify/react';

interface AdminProductsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function AdminProductsSearch({ value, onChange }: AdminProductsSearchProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Icon
        icon="solar:magnifer-bold-duotone"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجوی محصول..."
        className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}

