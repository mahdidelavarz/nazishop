'use client';

import { Icon } from '@iconify/react';
import { AdminProductListItem } from '../../types/adminProduct.types';

interface AdminProductsStatsProps {
  products: AdminProductListItem[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  iconBg: string;
  valueColor?: string;
}

function StatCard({ title, value, icon, iconBg, valueColor = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>
            {value.toLocaleString('fa-IR')}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function AdminProductsStats({ products }: AdminProductsStatsProps) {
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;
  const publicProducts = products.filter((p) => p.is_public).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="کل محصولات"
        value={totalProducts}
        icon="solar:box-bold-duotone"
        iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
      />
      <StatCard
        title="موجود در انبار"
        value={inStockProducts}
        icon="solar:check-circle-bold-duotone"
        iconBg="bg-gradient-to-br from-green-500 to-green-600"
        valueColor="text-green-600"
      />
      <StatCard
        title="ناموجود"
        value={outOfStockProducts}
        icon="solar:close-circle-bold-duotone"
        iconBg="bg-gradient-to-br from-red-500 to-red-600"
        valueColor="text-red-600"
      />
      <StatCard
        title="منتشر شده"
        value={publicProducts}
        icon="solar:eye-bold-duotone"
        iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        valueColor="text-blue-600"
      />
    </div>
  );
}

