'use client';

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { ProductFormData, calculateDiscountPercent } from './ProductFormSchema';

interface ProductPricingProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
}

export function ProductPricing({ register, errors, watch }: ProductPricingProps) {
  const price = watch('price');
  const originalPrice = watch('original_price');
  const discountPercent = calculateDiscountPercent(price, originalPrice);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon icon="solar:dollar-bold-duotone" className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">قیمت‌گذاری</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="solar:tag-price-bold-duotone" className="w-4 h-4 text-green-500" />
              قیمت فروش (تومان) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-gray-300"
                placeholder="250000"
                min={0}
              />
            </div>
            {errors.price && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
                <span>{errors.price.message}</span>
              </div>
            )}
          </div>

          {/* Original Price */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-gray-500" />
              قیمت اصلی (تومان)
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('original_price', { 
                  valueAsNumber: true,
                  setValueAs: (v) => v === '' || v === 0 ? null : Number(v)
                })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all outline-none hover:border-gray-300"
                placeholder="300000"
                min={0}
              />
            </div>
            {errors.original_price && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
                <span>{errors.original_price.message}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              برای محاسبه تخفیف، قیمت اصلی را وارد کنید
            </p>
          </div>
        </div>

        {/* Discount Preview */}
        {discountPercent !== null && discountPercent > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Icon icon="solar:discount-bold" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">تخفیف محاسبه شده</p>
                  <p className="text-xs text-green-600">
                    صرفه‌جویی: {((originalPrice || 0) - price).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {discountPercent}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

