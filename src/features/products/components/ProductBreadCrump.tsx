// features/products/components/ProductBreadcrumb.tsx
"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

interface ProductBreadcrumbProps {
  productTitle: string;
}

export function ProductBreadcrumb({ productTitle }: ProductBreadcrumbProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-pink-500 transition">
            خانه
          </Link>
          <Icon icon="ph:caret-left" width={16} />
          <Link href="/products" className="hover:text-pink-500 transition">
            محصولات
          </Link>
          <Icon icon="ph:caret-left" width={16} />
          <span className="text-gray-800 font-medium truncate max-w-xs">
            {productTitle}
          </span>
        </nav>
      </div>
    </div>
  );
}