'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const productSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  slug: z.string().min(1, 'اسلاگ الزامی است').regex(/^[a-z0-9-]+$/, 'فقط حروف کوچک، اعداد و خط تیره مجاز است'),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  stock: z.number().min(0, 'موجودی نمی‌تواند منفی باشد'),
  brand: z.string().optional(),
  description: z.string().optional(),
  thumbnail_url: z.string().url('آدرس معتبر وارد کنید').optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'ذخیره'
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      slug: '',
      price: 0,
      stock: 0,
      brand: '',
      description: '',
      thumbnail_url: '',
      ...defaultValues
    }
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!defaultValues?.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('slug', slug);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">اطلاعات اصلی</h2>
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان محصول <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            onChange={(e) => {
              register('title').onChange(e);
              handleTitleChange(e);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            placeholder="مثال: کرم مرطوب‌کننده روز"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسلاگ (URL) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('slug')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono text-sm"
            placeholder="day-moisturizer-cream"
            disabled={!!defaultValues?.slug}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
          {defaultValues?.slug && (
            <p className="mt-1 text-sm text-gray-500">اسلاگ پس از ایجاد قابل تغییر نیست</p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              قیمت (تومان) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              placeholder="250000"
              min={0}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موجودی انبار <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('stock', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              placeholder="100"
              min={0}
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            برند
          </label>
          <input
            {...register('brand')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            placeholder="مثال: L'Oréal"
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">تصاویر و رسانه</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            آدرس تصویر شاخص
          </label>
          <input
            {...register('thumbnail_url')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            placeholder="https://example.com/image.jpg"
          />
          {errors.thumbnail_url && (
            <p className="mt-1 text-sm text-red-600">{errors.thumbnail_url.message}</p>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">توضیحات</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            توضیحات محصول
          </label>
          <textarea
            {...register('description')}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
            placeholder="توضیحات کامل محصول را وارد کنید..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
        >
          {isSubmitting ? 'در حال ذخیره...' : submitLabel}
        </button>
      </div>
    </div>
  );
}