// Upload Service for Admin Products
import { UploadResponse } from '../types/adminProduct.types';

const UPLOAD_ENDPOINT = '/api/admin/products/upload';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
}

//!__________Upload Product Images__________
export const uploadProductImages = async (
  files: FileList | File[],
  options?: UploadOptions
): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const responseText = await response.text();
  let data: UploadResponse;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`خطا در پردازش پاسخ سرور: ${responseText.substring(0, 100)}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || data.details || `خطا در آپلود تصاویر (کد: ${response.status})`
    );
  }

  return data.urls || [];
};

//!__________Validate Image File__________
export const validateImageFile = (
  file: File,
  options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } => {
  const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `${file.name}: فقط فایل‌های تصویری مجاز هستند`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `${file.name}: حجم فایل نباید بیشتر از ${Math.round(maxSize / 1024 / 1024)}MB باشد`,
    };
  }

  return { valid: true };
};

//!__________Validate Multiple Image Files__________
export const validateImageFiles = (
  files: FileList | File[],
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    maxFiles?: number;
  }
): { valid: boolean; errors: string[]; validFiles: File[] } => {
  const errors: string[] = [];
  const validFiles: File[] = [];
  const maxFiles = options?.maxFiles || 10;

  if (files.length > maxFiles) {
    errors.push(`حداکثر ${maxFiles} تصویر مجاز است`);
  }

  Array.from(files)
    .slice(0, maxFiles)
    .forEach((file) => {
      const result = validateImageFile(file, options);
      if (result.valid) {
        validFiles.push(file);
      } else if (result.error) {
        errors.push(result.error);
      }
    });

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
};

//!__________Create Image Preview URL__________
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

//!__________Revoke Image Preview URL__________
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

//!__________Format File Size__________
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

