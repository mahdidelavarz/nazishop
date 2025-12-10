'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import type { Product } from '@/features/products/types/productsType';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminRoute();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/products');
      return res.data.products || [];
    },
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter((p: Product) => p.stock > 0).length || 0;
  const outOfStockProducts = products?.filter((p: Product) => p.stock === 0).length || 0;
  const totalValue = products?.reduce((sum: number, p: Product) => sum + (p.price * p.stock), 0) || 0;

  const quickActions = [
    {
      title: 'مدیریت محصولات',
      description: 'مشاهده، ویرایش و حذف محصولات',
      icon: '📦',
      color: 'from-purple-500 to-pink-500',
      action: () => router.push('/admin-products'),
    },
    {
      title: 'افزودن محصول',
      description: 'ایجاد محصول جدید',
      icon: '➕',
      color: 'from-blue-500 to-cyan-500',
      action: () => router.push('/admin-products/new'),
    },
    {
      title: 'سفارشات',
      description: 'مدیریت سفارشات مشتریان',
      icon: '🛒',
      color: 'from-green-500 to-emerald-500',
      action: () => router.push('/admin-orders'),
    },
    {
      title: 'مشتریان',
      description: 'مشاهده لیست مشتریان',
      icon: '👥',
      color: 'from-orange-500 to-red-500',
      action: () => alert('در حال توسعه...'),
    },
  ];

  const recentProducts = products?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد مدیریت</h1>
          <p className="text-gray-600">خوش آمدید! از اینجا می‌توانید فروشگاه خود را مدیریت کنید.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">کل محصولات</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalProducts}</p>
            <p className="text-sm text-gray-600">محصول ثبت شده</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">موجود</span>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{inStockProducts}</p>
            <p className="text-sm text-gray-600">محصول موجود</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ناموجود</span>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-1">{outOfStockProducts}</p>
            <p className="text-sm text-gray-600">محصول ناموجود</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ارزش کل</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {(totalValue / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-gray-600">تومان</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">دسترسی سریع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all group text-right"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{action.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">آخرین محصولات</h2>
            <button
              onClick={() => router.push('/admin-products')}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              مشاهده همه ←
            </button>
          </div>

          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🛍️</div>
              <p className="text-gray-600 mb-4">هنوز محصولی اضافه نشده است</p>
              <button
                onClick={() => router.push('/admin-products/new')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                افزودن اولین محصول
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product: Product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xl">💄</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.brand || 'بدون برند'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {product.price.toLocaleString('fa-IR')} تومان
                      </p>
                      <p className="text-sm text-gray-500">موجودی: {product.stock}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin-products/${product.slug}/edit`)}
                      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
                    >
                      ویرایش
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}