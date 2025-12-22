// Admin Products Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminProductsApi,
  fetchAdminProductApi,
  fetchProductDetailsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  upsertProductDetailsApi,
} from '../services/adminProductsService';
import {
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductDetailsPayload,
  UpdateProductDetailsPayload,
} from '../types/adminProduct.types';
import toast from 'react-hot-toast';

// Query Keys
export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: () => [...adminProductKeys.all, 'list'] as const,
  detail: (slug: string) => [...adminProductKeys.all, 'detail', slug] as const,
  details: (productId: string) => [...adminProductKeys.all, 'details', productId] as const,
};

//!__________Fetch Admin Products__________
export const useAdminProducts = () => {
  return useQuery({
    queryKey: adminProductKeys.list(),
    queryFn: fetchAdminProductsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

//!__________Fetch Single Admin Product__________
export const useAdminProduct = (slug: string) => {
  return useQuery({
    queryKey: adminProductKeys.detail(slug),
    queryFn: () => fetchAdminProductApi(slug),
    enabled: !!slug,
  });
};

//!__________Fetch Product Details__________
export const useProductDetails = (productId: string) => {
  return useQuery({
    queryKey: adminProductKeys.details(productId),
    queryFn: () => fetchProductDetailsApi(productId),
    enabled: !!productId,
  });
};

//!__________Create Product__________
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.list() });
      toast.success('محصول با موفقیت ایجاد شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ایجاد محصول');
    },
  });
};

//!__________Update Product__________
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.list() });
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(data.slug) });
      toast.success('محصول با موفقیت به‌روزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در به‌روزرسانی محصول');
    },
  });
};

//!__________Delete Product__________
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.list() });
      toast.success('محصول با موفقیت حذف شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در حذف محصول');
    },
  });
};

//!__________Upsert Product Details__________
export const useUpsertProductDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductDetailsPayload | UpdateProductDetailsPayload) =>
      upsertProductDetailsApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.details(data.product_id) });
      toast.success('جزئیات محصول با موفقیت ذخیره شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ذخیره جزئیات محصول');
    },
  });
};

//!__________Combined Create Product with Images__________
export interface CreateProductWithImagesPayload extends CreateProductPayload {
  images?: string[];
}

export const useCreateProductWithImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductWithImagesPayload) => {
      const { images, ...productPayload } = payload;
      
      // Create product
      const product = await createProductApi(productPayload);
      
      // If images provided, create product details
      if (images && images.length > 0) {
        await upsertProductDetailsApi({
          product_id: product.id,
          images,
        });
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.list() });
      toast.success('محصول با موفقیت ایجاد شد');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ایجاد محصول');
    },
  });
};

