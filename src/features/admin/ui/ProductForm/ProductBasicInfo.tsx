'use client';

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { ProductFormData } from './ProductFormSchema';
import { useBrandsLookup } from '@/features/brands/hooks/useBrandsLookup';
import { generateSlug } from '@/shared/utils/slug';

interface ProductBasicInfoProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  isEditMode?: boolean;
}

export function ProductBasicInfo({
  register,
  errors,
  watch,
  setValue,
  isEditMode = false,
}: ProductBasicInfoProps) {
  const titleValue = watch('title');
  const brandValue = watch('brand');
  const { data: brands = [], isLoading: brandsLoading } = useBrandsLookup();

  // Auto-generate slug from title (only in create mode)
  useEffect(() => {
    if (!isEditMode && titleValue) {
      setValue('slug', generateSlug(titleValue));
    }
  }, [titleValue, isEditMode, setValue]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5 text-pink-600" />
          <h2 className="text-lg font-bold text-gray-800">اطلاعات اصلی</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-pink-500" />
            عنوان محصول <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300"
            placeholder="مثال: کرم مرطوب‌کننده روز"
          />
          {errors.title && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
              <span>{errors.title.message}</span>
            </div>
          )}
        </div>

        {/* Slug */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Icon icon="solar:hashtag-bold-duotone" className="w-4 h-4 text-pink-500" />
            اسلاگ (URL) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('slug')}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300 font-mono text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="day-moisturizer-cream"
            disabled={isEditMode}
          />
          {errors.slug && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
              <span>{errors.slug.message}</span>
            </div>
          )}
          {isEditMode && (
            <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
              <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
              اسلاگ پس از ایجاد قابل تغییر نیست
            </p>
          )}
        </div>

        {/* Brand */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Icon icon="solar:star-bold-duotone" className="w-4 h-4 text-pink-500" />
            برند
          </label>
          {brandsLoading ? (
            <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">در حال بارگذاری برندها...</span>
            </div>
          ) : (
            <select
              {...register('brand')}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300 bg-white"
            >
              <option value="">انتخاب برند (اختیاری)</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
          )}
          {brandValue && (
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Icon icon="solar:check-circle-bold-duotone" className="w-3 h-3 text-green-500" />
              برند انتخاب شده: {brandValue}
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Icon icon="solar:barcode-bold-duotone" className="w-4 h-4 text-pink-500" />
            کد محصول (SKU)
          </label>
          <input
            {...register('sku')}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300 font-mono"
            placeholder="SKU-12345"
          />
        </div>
      </div>
    </div>
  );
}

