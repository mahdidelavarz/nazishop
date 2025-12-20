import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProductApi,
  deleteProductApi,
  fetchProductsApi,
  fetchSingleProductApi,
  updateProductApi,
} from "../services/productsService";
import { ProductListItem, SingleProduct } from "../types/productsType";
import { toast } from "react-hot-toast";

//!__________Fetch Products__________
export const useProductsQuery = () =>
  useQuery<ProductListItem[], Error>({
    queryKey: ["products"],
    queryFn: fetchProductsApi,
    staleTime: 5 * 60 * 1000,
  });

//!__________Fetch Single Product__________
export const useSingleProductQuery = (slug?: string) =>
  useQuery<SingleProduct, Error>({
    queryKey: ["product", slug],
    queryFn: () => fetchSingleProductApi(slug as string),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

//!__________Create Product__________
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      toast.success("محصول با موفقیت ایجاد شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "خطا در ایجاد محصول";
      toast.error(message);
    },
  });
};

//!__________Update Product__________
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductApi,
    onSuccess: (product) => {
      toast.success("محصول با موفقیت به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product.slug] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "خطا در به‌روزرسانی محصول";
      toast.error(message);
    },
  });
};

//!__________Delete Product__________
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      toast.success("محصول با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "خطا در حذف محصول";
      toast.error(message);
    },
  });
};
