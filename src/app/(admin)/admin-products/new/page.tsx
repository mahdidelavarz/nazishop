'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import { useCreateProductWithImages } from '@/features/admin/hooks/useAdminProducts';
import ProductForm from '@/features/admin/ui/ProductForm';
import { ProductFormData } from '@/features/admin/ui/ProductForm/ProductFormSchema';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function AdminNewProductPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminRoute();
  const createProduct = useCreateProductWithImages();
  const [error, setError] = useState<string | null>(null);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: ProductFormData, uploadedImages: string[]) => {
    setError(null);

    try {
      await createProduct.mutateAsync({
        title: data.title.trim(),
        slug: data.slug.trim(),
        price: data.price,
        original_price: data.original_price,
        stock: data.stock,
        brand_id: data.brand_id || null,
        description: data.description?.trim() || null,
        thumbnail_url: uploadedImages[0] || data.thumbnail_url?.trim() || null,
        sku: data.sku?.trim() || null,
        tags: data.tags.length > 0 ? data.tags : null,
        category_id: data.category_id || null,
        is_public: data.is_public,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      router.push('/admin-products');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'خطا در ایجاد محصول. لطفاً دوباره تلاش کنید.';
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
                <p className="font-medium text-red-700">خطا در ایجاد محصول</p>
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
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin-products')}
          isSubmitting={createProduct.isPending}
          submitLabel="ایجاد محصول"
        />
      </div>
    </div>
  );
}
