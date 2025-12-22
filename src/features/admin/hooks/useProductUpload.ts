// Product Upload Hook
import { useState, useCallback } from 'react';
import {
  uploadProductImages,
  validateImageFiles,
  createImagePreview,
  revokeImagePreview,
} from '../services/uploadService';

export interface ImagePreview {
  file: File;
  preview: string;
}

export interface UseProductUploadOptions {
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface UseProductUploadReturn {
  // State
  previews: ImagePreview[];
  isUploading: boolean;
  uploadProgress: number;
  errors: string[];
  
  // Actions
  addImages: (files: FileList | File[]) => void;
  removeImage: (index: number) => void;
  clearAllImages: () => void;
  uploadImages: () => Promise<string[]>;
  getFiles: () => File[];
}

const DEFAULT_OPTIONS: UseProductUploadOptions = {
  maxFiles: 10,
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
};

export const useProductUpload = (
  options?: UseProductUploadOptions
): UseProductUploadReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const addImages = useCallback((files: FileList | File[]) => {
    const { valid, errors: validationErrors, validFiles } = validateImageFiles(files, {
      maxSize: config.maxSize,
      allowedTypes: config.allowedTypes,
      maxFiles: config.maxFiles! - previews.length,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => ({
        file,
        preview: createImagePreview(file),
      }));
      
      setPreviews((prev) => [...prev, ...newPreviews]);
      setErrors([]);
    }
  }, [previews.length, config.maxSize, config.allowedTypes, config.maxFiles]);

  const removeImage = useCallback((index: number) => {
    setPreviews((prev) => {
      const toRemove = prev[index];
      if (toRemove) {
        revokeImagePreview(toRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
    setErrors([]);
  }, []);

  const clearAllImages = useCallback(() => {
    previews.forEach((item) => {
      revokeImagePreview(item.preview);
    });
    setPreviews([]);
    setErrors([]);
  }, [previews]);

  const uploadImages = useCallback(async (): Promise<string[]> => {
    if (previews.length === 0) {
      return [];
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      const files = previews.map((p) => p.file);
      const urls = await uploadProductImages(files, {
        onProgress: setUploadProgress,
      });
      
      setUploadProgress(100);
      return urls;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطا در آپلود تصاویر';
      setErrors([message]);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [previews]);

  const getFiles = useCallback((): File[] => {
    return previews.map((p) => p.file);
  }, [previews]);

  return {
    previews,
    isUploading,
    uploadProgress,
    errors,
    addImages,
    removeImage,
    clearAllImages,
    uploadImages,
    getFiles,
  };
};

