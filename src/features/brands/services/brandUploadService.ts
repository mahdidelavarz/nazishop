// Brand Upload Service
import { apiClient } from '@/shared/lib/api-client';

const UPLOAD_ENDPOINT = '/api/admin/brands/upload';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  message?: string;
  details?: string;
}

// Upload brand logo image
export const uploadBrandLogo = async (
  file: File,
  options?: UploadOptions
): Promise<string> => {
  if (!file) {
    throw new Error('هیچ فایلی انتخاب نشده است');
  }

  const formData = new FormData();
  formData.append('file', file);

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
      data.message || data.details || `خطا در آپلود لوگو (کد: ${response.status})`
    );
  }

  return data.url || '';
};

// Validate image file
export const validateBrandImageFile = (
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
    'image/svg+xml',
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

// Create image preview URL
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

// Revoke image preview URL
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

