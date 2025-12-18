'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';

const productSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  slug: z
    .string()
    .min(1, 'اسلاگ الزامی است')
    .regex(/^[a-z0-9-]+$/, 'فقط حروف کوچک، اعداد و خط تیره مجاز است'),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  stock: z.number().min(0, 'موجودی نمی‌تواند منفی باشد'),
  brand: z.string().optional(),
  description: z.string().optional(),
  thumbnail_url: z
    .string()
    .url('آدرس معتبر وارد کنید')
    .optional()
    .or(z.literal('')),
  images: z.any().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

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
  submitLabel = 'ذخیره محصول',
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
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
      ...defaultValues,
    },
  });

  const [previewImages, setPreviewImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  const titleValue = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (!defaultValues?.slug && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('slug', slug);
    }
  }, [titleValue, defaultValues?.slug, setValue]);

  const validateAndAddImages = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: Array<{ file: File; preview: string }> = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: فقط فایل‌های تصویری مجاز هستند`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: حجم فایل نباید بیشتر از 5MB باشد`);
        return;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setPreviewImages((prev) => [...prev, ...newImages]);
    
    const allFiles = [...previewImages.map(img => img.file), ...newImages.map(img => img.file)];
    const dataTransfer = new DataTransfer();
    allFiles.forEach(file => dataTransfer.items.add(file));
    setValue('images', dataTransfer.files);
  }, [previewImages, setValue]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddImages(e.dataTransfer.files);
    }
  }, [validateAndAddImages]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index].preview);
    
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
    
    const dataTransfer = new DataTransfer();
    newImages.forEach(img => dataTransfer.items.add(img.file));
    setValue('images', dataTransfer.files);
  };

  const clearAllImages = () => {
    previewImages.forEach((item) => {
      URL.revokeObjectURL(item.preview);
    });
    
    setPreviewImages([]);
    setValue('images', undefined);
  };

  useEffect(() => {
    const currentImages = previewImages;
    return () => {
      currentImages.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Icon icon="solar:box-bold-duotone" className="w-8 h-8" />
          <h1 className="text-3xl font-bold">
            {defaultValues ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </h1>
        </div>
        <p className="text-pink-100">اطلاعات محصول خود را با دقت وارد کنید</p>
      </div>

      {/* Basic Information */}
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
              disabled={!!defaultValues?.slug}
            />
            {errors.slug && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
                <span>{errors.slug.message}</span>
              </div>
            )}
            {defaultValues?.slug && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
                اسلاگ پس از ایجاد قابل تغییر نیست
              </p>
            )}
          </div>

          {/* Price and Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Icon icon="solar:dollar-bold-duotone" className="w-4 h-4 text-pink-500" />
                قیمت (تومان) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300"
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

            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Icon icon="solar:box-bold-duotone" className="w-4 h-4 text-pink-500" />
                موجودی انبار <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300"
                placeholder="100"
                min={0}
              />
              {errors.stock && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
                  <span>{errors.stock.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Brand */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="solar:star-bold-duotone" className="w-4 h-4 text-pink-500" />
              برند
            </label>
            <input
              {...register('brand')}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300"
              placeholder="مثال: L'Oréal"
            />
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Icon icon="solar:camera-bold-duotone" className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-bold text-gray-800">تصاویر و رسانه</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Thumbnail URL */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="solar:gallery-bold-duotone" className="w-4 h-4 text-pink-500" />
              آدرس تصویر شاخص
            </label>
            <input
              {...register('thumbnail_url')}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none hover:border-gray-300"
              placeholder="https://example.com/image.jpg"
            />
            {errors.thumbnail_url && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
                <span>{errors.thumbnail_url.message}</span>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Icon icon="solar:upload-bold-duotone" className="w-4 h-4 text-pink-500" />
              آپلود تصاویر محصول
              {previewImages.length > 0 && (
                <span className="text-gray-500 font-normal">
                  ({previewImages.length} تصویر)
                </span>
              )}
            </label>
            
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                ${dragActive 
                  ? 'border-pink-500 bg-pink-50 scale-[1.02]' 
                  : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-pink-400 hover:bg-pink-50/50'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <Controller
                name="images"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <input
                    {...field}
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      validateAndAddImages(e.target.files);
                      onChange(e.target.files);
                    }}
                    className="hidden"
                  />
                )}
              />
              
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Icon icon="solar:cloud-upload-bold-duotone" className="w-10 h-10 text-pink-600" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-2">
                  تصاویر خود را اینجا بکشید یا کلیک کنید
                </p>
                <p className="text-sm text-gray-500">
                  فرمت‌های مجاز: JPG, PNG, WebP, GIF - حداکثر 5MB
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Icon icon="solar:gallery-bold-duotone" className="w-4 h-4" />
                    پیش‌نمایش ({previewImages.length} تصویر)
                  </p>
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                    پاک کردن همه
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {previewImages.map((item, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-300 bg-white shadow-md hover:shadow-xl transition-all hover:scale-105"
                    >
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                          aria-label="Remove image"
                        >
                          <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-white text-xs font-medium truncate">
                          {item.file.name}
                        </p>
                        <p className="text-white/80 text-xs">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-2 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow flex items-center gap-2"
        >
          <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
          انصراف
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
}