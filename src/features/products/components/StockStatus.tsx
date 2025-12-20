// features/products/components/StockStatus.tsx
"use client";

import { Icon } from "@iconify/react";

interface StockStatusProps {
  stock: number;
}

export function StockStatus({ stock }: StockStatusProps) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <Icon icon="ph:x-circle-duotone" width={24} />
        <span className="font-medium">ناموجود</span>
      </div>
    );
  }

  if (stock < 10) {
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <Icon icon="ph:warning-duotone" width={24} />
        <span className="font-medium">
          تنها {stock} عدد در انبار باقی مانده
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600">
      <Icon icon="ph:check-circle-duotone" width={24} />
      <span className="font-medium">موجود در انبار</span>
    </div>
  );
}