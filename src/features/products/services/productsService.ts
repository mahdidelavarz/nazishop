import { apiClient } from "@/shared/lib/api-client";
import {
  CreateProductType,
  ProductListItem,
  SingleProduct,
  UpdateProductType,
} from "../types/productsType";


//!__________Fetch Products__________
export const fetchProductsApi = async (): Promise<ProductListItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    products: ProductListItem[];
  }>("/products");
  if (!response.data.success) {
    throw new Error("خطا در دریافت محصولات");
  }
  return response.data.products || [];
};

//!__________Fetch Single Product__________
export const fetchSingleProductApi = async (
  slug: string
): Promise<SingleProduct> => {
  const response = await apiClient.get<{
    success: boolean;
    product: SingleProduct;
  }>(`/products/${slug}`);
  if (!response.data.success || !response.data.product) {
    throw new Error("محصول یافت نشد");
  }
  return response.data.product;
};

//!__________Create Product__________
export const createProductApi = async (
  payload: CreateProductType
): Promise<SingleProduct> => {
  const { data } = await apiClient.post<{
    success: boolean;
    product: SingleProduct;
    message?: string;
  }>("/admin/products", payload);

  if (!data.success || !data.product) {
    throw new Error(data.message || "خطا در ایجاد محصول");
  }

  return data.product;
};

//!__________Update Product__________
export const updateProductApi = async (
  payload: UpdateProductType
): Promise<SingleProduct> => {
  const { data } = await apiClient.put<{
    success: boolean;
    product: SingleProduct;
    message?: string;
  }>("/admin/products", payload);

  if (!data.success || !data.product) {
    throw new Error(data.message || "خطا در به‌روزرسانی محصول");
  }

  return data.product;
};

//!__________Delete Product__________
export const deleteProductApi = async (id: string): Promise<string | undefined> => {
  const { data } = await apiClient.delete<{
    success: boolean;
    message?: string;
  }>(`/admin/products/${id}`);
  if (!data.success) {
    throw new Error(data.message || "خطا در حذف محصول");
  }
  return data.message || "محصول با موفقیت حذف شد";
};