import { apiClient } from "@/shared/lib/api-client";
import { Product } from "../types/productsType";

export const fetchProductsApi = async (): Promise<Product[]> => {
  const response = await apiClient.get<{ success: boolean; products: Product[] }>(
    "/products"
  );
  if (!response.data.success) {
    throw new Error("خطا در دریافت محصولات");
  }
  return response.data.products || [];
};

export const fetchSingleProductApi = async (slug: string): Promise<Product> => {
  const response = await apiClient.get<{ success: boolean; product: Product }>(
    `/products/${slug}`
  );
  if (!response.data.success || !response.data.product) {
    throw new Error("محصول یافت نشد");
  }
  return response.data.product;
};
