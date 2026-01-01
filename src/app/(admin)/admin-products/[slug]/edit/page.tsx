'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import { useAdminProduct, useUpdateProduct } from '@/features/admin/hooks/useAdminProducts';
import ProductForm from '@/features/admin/ui/ProductForm';
import { ProductFormData } from '@/features/admin/ui/ProductForm/ProductFormSchema';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';

  const { user, isLoading: authLoading } = useAdminRoute();
  const { data: product, isLoading: productLoading, isError } = useAdminProduct(slug);
  const updateProduct = useUpdateProduct();
  const [error, setError] = useState<string | null>(null);

  // Auth loading
  if (authLoading || !user) {
    return <LoadingScreen message="در حال بررسی دسترسی..." />;
  }

  // Product loading
  if (productLoading) {
    return <LoadingScreen message="در حال بارگذاری محصول..." />;
  }

  // Error or not found
  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:box-bold-duotone" className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">محصول یافت نشد</h2>
          <p className="text-gray-500 mb-6">محصولی با این اسلاگ وجود ندارد</p>
          <Link
            href="/admin-products"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all inline-block"
          >
            بازگشت به لیست محصولات
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: ProductFormData, uploadedImages: string[]) => {
    setError(null);

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        title: data.title.trim(),
        price: data.price,
        original_price: data.original_price,
        stock: data.stock,
        brand_id: data.brand_id || null,
        description: data.description?.trim() || null,
        thumbnail_url: uploadedImages[0] || data.thumbnail_url?.trim() || product.thumbnail_url,
        sku: data.sku?.trim() || null,
        tags: data.tags.length > 0 ? data.tags : null,
        category_id: data.category_id || null,
        is_public: data.is_public,
      });

      router.push('/admin-products');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'خطا در به‌روزرسانی محصول. لطفاً دوباره تلاش کنید.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/admin-products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <Icon 
            icon="solar:arrow-right-bold" 
            className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
          />
          <span>بازگشت به لیست محصولات</span>
        </Link>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <Icon icon="solar:danger-triangle-bold-duotone" className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">خطا در به‌روزرسانی محصول</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="mr-auto p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <ProductForm
          defaultValues={{
            title: product.title,
            slug: product.slug,
            price: product.price,
            original_price: product.original_price,
            stock: product.stock,
            brand_id: product.brand_id,
            description: product.description,
            thumbnail_url: product.thumbnail_url,
            sku: product.sku,
            tags: product.tags || [],
            category_id: product.category_id,
            is_public: product.is_public,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin-products')}
          isSubmitting={updateProduct.isPending}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}

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
