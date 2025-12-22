'use client';

import { AdminProductListItem } from '../../types/adminProduct.types';
import { AdminProductCard } from './AdminProductCard';

interface AdminProductsGridProps {
  products: AdminProductListItem[];
  onDelete?: (id: string) => void;
}

export function AdminProductsGrid({ products, onDelete }: AdminProductsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <AdminProductCard
          key={product.id}
          product={product}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

