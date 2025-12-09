'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import type { Product } from '@/features/products/types/productsType';

interface AdminProductsResponse {
  success: boolean;
  products: Product[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminRoute();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await apiClient.get<AdminProductsResponse>('/admin/products');
      return res.data.products || [];
    },
  });

  if (authLoading || !user) {
    return <div className="p-8">در حال بررسی دسترسی...</div>;
  }

  if (isLoading) {
    return <div className="p-8">در حال بارگذاری محصولات...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">خطا در دریافت محصولات</div>;
  }

  const products = data || [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
        <button
          onClick={() => router.push('/admin-products/new')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
        >
          محصول جدید
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-right">عنوان</th>
              <th className="px-4 py-2 text-right">برند</th>
              <th className="px-4 py-2 text-right">قیمت</th>
              <th className="px-4 py-2 text-right">موجودی</th>
              <th className="px-4 py-2 text-right">اسلاگ</th>
              <th className="px-4 py-2 text-right">اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={6}>
                  محصولی یافت نشد
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">{product.title}</td>
                  <td className="px-4 py-2">{product.brand || '-'}</td>
                  <td className="px-4 py-2">{product.price.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-2">{product.stock}</td>
                  <td className="px-4 py-2">{product.slug}</td>
                  <td className="px-4 py-2 space-x-2 space-x-reverse">
                    <button
                      onClick={() => router.push(`/admin-products/${product.slug}/edit`)}
                      className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                    >
                      ویرایش
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
