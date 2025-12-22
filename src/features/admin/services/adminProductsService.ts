// Admin Products Service
import { apiClient } from '@/shared/lib/api-client';
import {
  AdminProductListItem,
  AdminProduct,
  AdminProductDetails,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductDetailsPayload,
  UpdateProductDetailsPayload,
  AdminProductsResponse,
  AdminProductResponse,
  AdminProductDetailsResponse,
} from '../types/adminProduct.types';

//!__________Fetch Admin Products__________
export const fetchAdminProductsApi = async (): Promise<AdminProductListItem[]> => {
  const response = await apiClient.get<AdminProductsResponse>('/admin/products');
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در دریافت محصولات');
  }
  return response.data.products || [];
};

//!__________Fetch Single Admin Product__________
export const fetchAdminProductApi = async (slug: string): Promise<AdminProduct> => {
  const response = await apiClient.get<AdminProductResponse>(`/products/${slug}`);
  if (!response.data.success || !response.data.product) {
    throw new Error(response.data.message || 'محصول یافت نشد');
  }
  return response.data.product;
};

//!__________Fetch Product Details__________
export const fetchProductDetailsApi = async (productId: string): Promise<AdminProductDetails | null> => {
  const response = await apiClient.get<AdminProductDetailsResponse>(`/admin/products/${productId}/details`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در دریافت جزئیات محصول');
  }
  return response.data.details;
};

//!__________Create Product__________
export const createProductApi = async (payload: CreateProductPayload): Promise<AdminProduct> => {
  const response = await apiClient.post<AdminProductResponse>('/admin/products', payload);
  if (!response.data.success || !response.data.product) {
    throw new Error(response.data.message || 'خطا در ایجاد محصول');
  }
  return response.data.product;
};

//!__________Update Product__________
export const updateProductApi = async (payload: UpdateProductPayload): Promise<AdminProduct> => {
  const response = await apiClient.put<AdminProductResponse>('/admin/products', payload);
  if (!response.data.success || !response.data.product) {
    throw new Error(response.data.message || 'خطا در به‌روزرسانی محصول');
  }
  return response.data.product;
};

//!__________Delete Product__________
export const deleteProductApi = async (id: string): Promise<string> => {
  const response = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/products/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'خطا در حذف محصول');
  }
  return response.data.message || 'محصول با موفقیت حذف شد';
};

//!__________Create/Update Product Details__________
export const upsertProductDetailsApi = async (
  payload: CreateProductDetailsPayload | UpdateProductDetailsPayload
): Promise<AdminProductDetails> => {
  const response = await apiClient.post<AdminProductDetailsResponse>(
    `/admin/products/${payload.product_id}/details`,
    payload
  );
  if (!response.data.success || !response.data.details) {
    throw new Error(response.data.message || 'خطا در ذخیره جزئیات محصول');
  }
  return response.data.details;
};

