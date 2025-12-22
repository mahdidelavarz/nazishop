'use client';

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { ProductFormData } from './ProductFormSchema';

interface ProductInventoryProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
}

export function ProductInventory({ register, errors, watch }: ProductInventoryProps) {
  const stock = watch('stock');
  const isPublic = watch('is_public');

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-800">موجودی و وضعیت</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stock */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Icon icon="solar:box-bold-duotone" className="w-4 h-4 text-purple-500" />
            موجودی انبار <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none hover:border-gray-300"
            placeholder="100"
            min={0}
          />
          {errors.stock && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
              <span>{errors.stock.message}</span>
            </div>
          )}
          
          {/* Stock Status Preview */}
          <div className="mt-3">
            {stock === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                ناموجود
              </span>
            ) : stock <= 10 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                موجودی کم
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                موجود
              </span>
            )}
          </div>
        </div>

        {/* Is Public Toggle */}
        <div className="group">
          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPublic ? 'bg-green-100' : 'bg-gray-200'
              }`}>
                <Icon 
                  icon={isPublic ? "solar:eye-bold-duotone" : "solar:eye-closed-bold-duotone"} 
                  className={`w-5 h-5 ${isPublic ? 'text-green-600' : 'text-gray-500'}`} 
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800">نمایش در فروشگاه</p>
                <p className="text-xs text-gray-500">
                  {isPublic ? 'محصول برای مشتریان قابل مشاهده است' : 'محصول مخفی است'}
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                {...register('is_public')}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

