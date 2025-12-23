// Brand Upload Hook
import { useState, useCallback } from 'react';
import {
  uploadBrandLogo,
  validateBrandImageFile,
  createImagePreview,
  revokeImagePreview,
} from '../services/brandUploadService';

export interface ImagePreview {
  file: File;
  preview: string;
}

export interface UseBrandUploadReturn {
  preview: ImagePreview | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  
  // Actions
  setImage: (file: File | null) => void;
  clearImage: () => void;
  uploadImage: () => Promise<string>;
}

export const useBrandUpload = (): UseBrandUploadReturn => {
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const setImage = useCallback((file: File | null) => {
    if (!file) {
      clearImage();
      return;
    }

    const validation = validateBrandImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'فایل نامعتبر است');
      return;
    }

    setError(null);
    const previewUrl = createImagePreview(file);
    setPreview({
      file,
      preview: previewUrl,
    });
  }, []);

  const clearImage = useCallback(() => {
    if (preview) {
      revokeImagePreview(preview.preview);
    }
    setPreview(null);
    setError(null);
  }, [preview]);

  const uploadImage = useCallback(async (): Promise<string> => {
    if (!preview) {
      throw new Error('هیچ تصویری انتخاب نشده است');
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const url = await uploadBrandLogo(preview.file, {
        onProgress: setUploadProgress,
      });
      
      setUploadProgress(100);
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در آپلود تصویر';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [preview]);

  return {
    preview,
    isUploading,
    uploadProgress,
    error,
    setImage,
    clearImage,
    uploadImage,
  };
};

