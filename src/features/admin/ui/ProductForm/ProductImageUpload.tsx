'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { ProductFormData } from './ProductFormSchema';
import { useProductUpload, ImagePreview } from '../../hooks/useProductUpload';
import { formatFileSize } from '../../services/uploadService';

interface ProductImageUploadProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  uploadHook: ReturnType<typeof useProductUpload>;
}

export function ProductImageUpload({ register, errors, uploadHook }: ProductImageUploadProps) {
  const {
    previews,
    isUploading,
    errors: uploadErrors,
    addImages,
    removeImage,
    clearAllImages,
  } = uploadHook;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addImages(e.target.files);
    }
  };

  return (
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
          <p className="mt-2 text-xs text-gray-500">
            اگر تصویر آپلود کنید، اولین تصویر به عنوان شاخص استفاده می‌شود
          </p>
        </div>

        {/* Upload Errors */}
        {uploadErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 mb-1">خطا در آپلود</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {uploadErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:border-pink-400 hover:bg-pink-50/50"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
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
        {previews.length > 0 && (
          <ImagePreviewGrid
            previews={previews}
            onRemove={removeImage}
            onClearAll={clearAllImages}
            isUploading={isUploading}
          />
        )}
      </div>
    </div>
  );
}

// Image Preview Grid Component
interface ImagePreviewGridProps {
  previews: ImagePreview[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
  isUploading: boolean;
}

function ImagePreviewGrid({ previews, onRemove, onClearAll, isUploading }: ImagePreviewGridProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Icon icon="solar:gallery-bold-duotone" className="w-4 h-4" />
          پیش‌نمایش ({previews.length} تصویر)
        </p>
        <button
          type="button"
          onClick={onClearAll}
          disabled={isUploading}
          className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all disabled:opacity-50"
        >
          <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
          پاک کردن همه
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {previews.map((item, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-300 bg-white shadow-md hover:shadow-xl transition-all hover:scale-105"
          >
            <img
              src={item.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                شاخص
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                disabled={isUploading}
                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110 disabled:opacity-50"
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
                {formatFileSize(item.file.size)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

