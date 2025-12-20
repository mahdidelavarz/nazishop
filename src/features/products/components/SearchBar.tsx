// features/products/components/SearchBar.tsx
"use client";

import { Icon } from "@iconify/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "جستجوی محصولات..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Icon
        icon="ph:magnifying-glass-duotone"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        width={20}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          aria-label="پاک کردن جستجو"
        >
          <Icon icon="ph:x-circle-duotone" width={20} />
        </button>
      )}
    </div>
  );
}