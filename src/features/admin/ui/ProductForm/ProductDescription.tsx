'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { ProductFormData } from './ProductFormSchema';

interface ProductDescriptionProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function ProductDescription({ register, errors }: ProductDescriptionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon icon="solar:align-left-bold-duotone" className="w-5 h-5 text-pink-600" />
          <h2 className="text-lg font-bold text-gray-800">توضیحات محصول</h2>
        </div>
      </div>

      <div className="p-6">
        <textarea
          {...register('description')}
          rows={6}
          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300 resize-none"
          placeholder="توضیحات کامل و جامع محصول را در اینجا وارد کنید. این توضیحات برای مشتریان نمایش داده می‌شود..."
        />
        {errors.description && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
            <span>{errors.description.message}</span>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">
          توضیحات خوب به فروش بیشتر کمک می‌کند. ویژگی‌ها، مزایا و نحوه استفاده را شرح دهید.
        </p>
      </div>
    </div>
  );
}

