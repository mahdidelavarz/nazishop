'use client';

import { useState, useMemo } from 'react';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import { useAdminProducts, useDeleteProduct } from '@/features/admin/hooks/useAdminProducts';
import {
  AdminProductsHeader,
  AdminProductsStats,
  AdminProductsToolbar,
  AdminProductsGrid,
  AdminProductsTable,
  AdminProductsEmpty,
  ViewMode,
} from '@/features/admin/ui/AdminProducts';
import { Icon } from '@iconify/react';

export default function AdminProductsPage() {
  const { user, isLoading: authLoading } = useAdminRoute();
  const { data: products, isLoading, isError, refetch } = useAdminProducts();
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch {
        // Error is handled by the hook
      }
    }
  };

  // Loading state
  if (authLoading || !user) {
    return <LoadingScreen message="در حال بررسی دسترسی..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="در حال بارگذاری محصولات..." />;
  }

  if (isError) {
    return <ErrorScreen onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AdminProductsHeader totalProducts={products?.length || 0} />
        
        <AdminProductsStats products={products || []} />
        
        <AdminProductsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {filteredProducts.length === 0 ? (
          searchQuery ? (
            <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
          ) : (
            <AdminProductsEmpty />
          )
        ) : viewMode === 'grid' ? (
          <AdminProductsGrid products={filteredProducts} onDelete={handleDelete} />
        ) : (
          <AdminProductsTable products={filteredProducts} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Error Screen Component
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:danger-triangle-bold-duotone" className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">خطا در دریافت محصولات</h2>
        <p className="text-gray-500 mb-6">مشکلی در برقراری ارتباط با سرور پیش آمده است</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

// No Search Results Component
function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:magnifer-bold-duotone" className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          نتیجه‌ای یافت نشد
        </h3>
        <p className="text-gray-500 mb-4">
          محصولی با عبارت «{query}» پیدا نشد
        </p>
        <button
          onClick={onClear}
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          پاک کردن جستجو
        </button>
      </div>
    </div>
  );
}
