"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/shared/lib/api-client";
import { useAdminRoute } from "@/features/auth/hooks/useAdminRoute";
import type { Product } from "@/features/products/types/productsType";
import ProductForm from "@/features/admin/ui/ProductForm";

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { user, isLoading: authLoading } = useAdminRoute();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; product: Product }>(
          `/products/${slug}`
        );
        if (!res.data.success || !res.data.product) {
          throw new Error("محصول یافت نشد");
        }
        setProduct(res.data.product);
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت محصول");
      } finally {
        setLoadingProduct(false);
      }
    };

    load();
  }, [slug]);

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

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری محصول...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">
            {error || "محصول یافت نشد"}
          </p>
          <button
            onClick={() => router.push("/admin-products")}
            className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all"
          >
            بازگشت به لیست محصولات
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        id: product.id,
        title: data.title.trim(),
        price: data.price,
        stock: data.stock,
        brand: data.brand?.trim() || null,
        description: data.description?.trim() || null,
        thumbnail_url: data.thumbnail_url?.trim() || null,
      };

      const res = await apiClient.put("/admin/products", payload);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "خطا در به‌روزرسانی محصول");
      }

      router.push("/admin-products");
    } catch (err) {
      console.error(err);
      setError("خطا در به‌روزرسانی محصول. لطفاً دوباره تلاش کنید.");
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
            ویرایش محصول
          </h1>
          <p className="text-gray-600">اطلاعات محصول را ویرایش کنید</p>
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
          defaultValues={{
            title: product.title,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            brand: product.brand || "",
            description: product.description || "",
            thumbnail_url: product.thumbnail_url || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin-products")}
          isSubmitting={isSubmitting}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
