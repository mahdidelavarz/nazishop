'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { productFormSchema, ProductFormData, defaultFormValues } from './ProductFormSchema';
import { ProductBasicInfo } from './ProductBasicInfo';
import { ProductPricing } from './ProductPricing';
import { ProductInventory } from './ProductInventory';
import { ProductImageUpload } from './ProductImageUpload';
import { ProductDescription } from './ProductDescription';
import { ProductTags } from './ProductTags';
import { ProductFormActions } from './ProductFormActions';
import { useProductUpload } from '../../hooks/useProductUpload';

export interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData, uploadedImages: string[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'ذخیره محصول',
}: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaultFormValues,
      ...defaultValues,
    },
  });

  const uploadHook = useProductUpload();
  const isEditMode = !!defaultValues?.slug;

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      // Upload images first
      let uploadedUrls: string[] = [];
      if (uploadHook.previews.length > 0) {
        uploadedUrls = await uploadHook.uploadImages();
      }
      
      // Call parent submit with form data and uploaded image URLs
      await onSubmit(data, uploadedUrls);
    } catch (error) {
      // Error is handled by uploadHook
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon="solar:box-bold-duotone" className="w-8 h-8" />
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </h1>
        </div>
        <p className="text-pink-100">اطلاعات محصول خود را با دقت وارد کنید</p>
      </div>

      {/* Basic Info */}
      <ProductBasicInfo
        register={form.register}
        errors={form.formState.errors}
        watch={form.watch}
        setValue={form.setValue}
        isEditMode={isEditMode}
      />

      {/* Pricing */}
      <ProductPricing
        register={form.register}
        errors={form.formState.errors}
        watch={form.watch}
      />

      {/* Inventory */}
      <ProductInventory
        register={form.register}
        errors={form.formState.errors}
        watch={form.watch}
      />

      {/* Image Upload */}
      <ProductImageUpload
        register={form.register}
        errors={form.formState.errors}
        uploadHook={uploadHook}
      />

      {/* Description */}
      <ProductDescription
        register={form.register}
        errors={form.formState.errors}
      />

      {/* Tags */}
      <ProductTags
        watch={form.watch}
        setValue={form.setValue}
      />

      {/* Actions */}
      <ProductFormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting || uploadHook.isUploading}
        submitLabel={submitLabel}
      />
    </form>
  );
}

// Re-export types and components
export { ProductFormData } from './ProductFormSchema';
export { ProductBasicInfo } from './ProductBasicInfo';
export { ProductPricing } from './ProductPricing';
export { ProductInventory } from './ProductInventory';
export { ProductImageUpload } from './ProductImageUpload';
export { ProductDescription } from './ProductDescription';
export { ProductTags } from './ProductTags';
export { ProductFormActions } from './ProductFormActions';

