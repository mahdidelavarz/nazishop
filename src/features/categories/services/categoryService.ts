import { apiClient } from '@/shared/lib/api-client';
import {
  Category,
  CategoryWithCount,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoriesResponse,
  CategoryResponse,
} from '../types/categoryTypes';

// Fetch all categories (public)
export const fetchCategoriesApi = async (): Promise<CategoryWithCount[]> => {
  const response = await apiClient.get<CategoriesResponse>('/categories');
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در دریافت دسته‌بندی‌ها');
  }
  return response.data.categories || [];
};

// Fetch all categories (admin - without count)
export const fetchAdminCategoriesApi = async (): Promise<Category[]> => {
  const response = await apiClient.get<{ success: boolean; categories: Category[] }>('/admin/categories');
  if (!response.data.success) {
    throw new Error('خطا در دریافت دسته‌بندی‌ها');
  }
  return response.data.categories || [];
};

// Fetch single category (admin)
export const fetchAdminCategoryApi = async (id: string): Promise<Category> => {
  const response = await apiClient.get<CategoryResponse>(`/admin/categories/${id}`);
  if (!response.data.success || !response.data.category) {
    throw new Error(response.data.message || 'دسته‌بندی یافت نشد');
  }
  return response.data.category;
};

// Create category (admin)
export const createCategoryApi = async (payload: CreateCategoryPayload): Promise<Category> => {
  const response = await apiClient.post<CategoryResponse>('/admin/categories', payload);
  if (!response.data.success || !response.data.category) {
    throw new Error(response.data.message || 'خطا در ایجاد دسته‌بندی');
  }
  return response.data.category;
};

// Update category (admin)
export const updateCategoryApi = async (payload: UpdateCategoryPayload): Promise<Category> => {
  const response = await apiClient.put<CategoryResponse>('/admin/categories', payload);
  if (!response.data.success || !response.data.category) {
    throw new Error(response.data.message || 'خطا در به‌روزرسانی دسته‌بندی');
  }
  return response.data.category;
};

// Delete category (admin)
export const deleteCategoryApi = async (id: string): Promise<string> => {
  const response = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/categories/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در حذف دسته‌بندی');
  }
  return response.data.message || 'دسته‌بندی با موفقیت حذف شد';
};

