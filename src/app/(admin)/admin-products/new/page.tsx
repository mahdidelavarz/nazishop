"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/shared/lib/api-client";
import { useAdminRoute } from "@/features/auth/hooks/useAdminRoute";
import ProductForm from "@/features/admin/ui/ProductForm";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: any) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        price: data.price,
        stock: data.stock,
        brand: data.brand?.trim() || null,
        description: data.description?.trim() || null,
        thumbnail_url: data.thumbnail_url?.trim() || null,
      };

      const res = await apiClient.post("/admin/products", payload);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "خطا در ایجاد محصول");
      }

      router.push("/admin-products");
    } catch (err) {
      console.error(err);
      setError("خطا در ایجاد محصول. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin-products")}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            بازگشت به لیست محصولات
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            افزودن محصول جدید
          </h1>
          <p className="text-gray-600">اطلاعات محصول جدید را وارد کنید</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin-products")}
          isSubmitting={isSubmitting}
          submitLabel="ایجاد محصول"
        />
      </div>
    </div>
  );
}
