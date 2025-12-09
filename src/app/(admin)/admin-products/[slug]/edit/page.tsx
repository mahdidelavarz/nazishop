'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import type { Product } from '@/features/products/types/productsType';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { user, isLoading: authLoading } = useAdminRoute();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; product: Product }>(
          `/products/${slug}`
        );
        if (!res.data.success || !res.data.product) {
          throw new Error('محصول یافت نشد');
        }
        const p = res.data.product;
        setProduct(p);
        setTitle(p.title);
        setPrice(String(p.price));
        setStock(String(p.stock));
        setBrand(p.brand || '');
        setDescription(p.description || '');
        setThumbnailUrl(p.thumbnail_url || '');
      } catch (err) {
        console.error(err);
        setError('خطا در دریافت محصول');
      } finally {
        setLoadingProduct(false);
      }
    };

    load();
  }, [slug]);

  if (authLoading || !user) {
    return <div className="p-8">در حال بررسی دسترسی...</div>;
  }

  if (loadingProduct) {
    return <div className="p-8">در حال بارگذاری محصول...</div>;
  }

  if (!product) {
    return <div className="p-8 text-red-500">{error || 'محصول یافت نشد'}</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        id: product.id,
        title: title.trim(),
        price: Number(price),
        stock: Number(stock),
        brand: brand.trim() || null,
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
      };

      const res = await apiClient.put('/admin/products', payload);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'خطا در به‌روزرسانی محصول');
      }

      router.push('/admin-products');
    } catch (err) {
      console.error(err);
      setError('خطا در به‌روزرسانی محصول');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ویرایش محصول</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">عنوان</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">قیمت</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">موجودی</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">برند</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">آدرس تصویر (Thumbnail URL)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">توضیحات</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin-products')}
            className="px-4 py-2 rounded border text-sm"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
