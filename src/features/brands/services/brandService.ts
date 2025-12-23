import { apiClient } from '@/shared/lib/api-client';
import {
  Brand,
  BrandWithCount,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandsResponse,
  BrandResponse,
} from '../types/brandTypes';

// Fetch all brands (public)
export const fetchBrandsApi = async (): Promise<BrandWithCount[]> => {
  const response = await apiClient.get<BrandsResponse>('/brands');
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در دریافت برندها');
  }
  return response.data.brands || [];
};

// Fetch all brands (admin - without count)
export const fetchAdminBrandsApi = async (): Promise<Brand[]> => {
  const response = await apiClient.get<{ success: boolean; brands: Brand[] }>('/admin/brands');
  if (!response.data.success) {
    throw new Error('خطا در دریافت برندها');
  }
  return response.data.brands || [];
};

// Fetch single brand (admin)
export const fetchAdminBrandApi = async (id: string): Promise<Brand> => {
  const response = await apiClient.get<BrandResponse>(`/admin/brands/${id}`);
  if (!response.data.success || !response.data.brand) {
    throw new Error(response.data.message || 'برند یافت نشد');
  }
  return response.data.brand;
};

// Create brand (admin)
export const createBrandApi = async (payload: CreateBrandPayload): Promise<Brand> => {
  const response = await apiClient.post<BrandResponse>('/admin/brands', payload);
  if (!response.data.success || !response.data.brand) {
    throw new Error(response.data.message || 'خطا در ایجاد برند');
  }
  return response.data.brand;
};

// Update brand (admin)
export const updateBrandApi = async (payload: UpdateBrandPayload): Promise<Brand> => {
  const response = await apiClient.put<BrandResponse>('/admin/brands', payload);
  if (!response.data.success || !response.data.brand) {
    throw new Error(response.data.message || 'خطا در به‌روزرسانی برند');
  }
  return response.data.brand;
};

// Delete brand (admin)
export const deleteBrandApi = async (id: string): Promise<string> => {
  const response = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/brands/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در حذف برند');
  }
  return response.data.message || 'برند با موفقیت حذف شد';
};

