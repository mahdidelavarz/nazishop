'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';

export default function AdminNewProductPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminRoute();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || !user) {
    return <div className="p-8">در حال بررسی دسترسی...</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        price: Number(price),
        stock: Number(stock),
        brand: brand.trim() || null,
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
      };

      const res = await apiClient.post('/admin/products', payload);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'خطا در ایجاد محصول');
      }

      router.push('/admin-products');
    } catch (err) {
      console.error(err);
      setError('خطا در ایجاد محصول');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ایجاد محصول جدید</h1>

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

        <div>
          <label className="block text-sm font-medium mb-1">اسلاگ</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
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
            {isSubmitting ? 'در حال ذخیره...' : 'ایجاد محصول'}
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
