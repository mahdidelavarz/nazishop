"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  fetchBrandsApi,
  fetchAdminBrandsApi,
  fetchAdminBrandApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
} from "../services/brandService";
import {
  Brand,
  BrandWithCount,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "../types/brandTypes";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ------------------------
// Fetch brands (public)
// ------------------------
export const useBrands = () => {
  return useQuery<BrandWithCount[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      return await fetchBrandsApi();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ------------------------
// Fetch brands (admin)
// ------------------------
export const useAdminBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      return await fetchAdminBrandsApi();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ------------------------
// Fetch single brand (admin)
// ------------------------
export const useAdminBrand = (id: string | null) => {
  return useQuery<Brand>({
    queryKey: ["admin-brand", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Brand ID is required");
      return await fetchAdminBrandApi(id);
    },
  });
};

// ------------------------
// Create brand (admin)
// ------------------------
export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBrandPayload) => {
      return await createBrandApi(payload);
    },
    onSuccess: (data) => {
      toast.success("برند با موفقیت ایجاد شد");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در ایجاد برند")
          : "خطا در ایجاد برند";
      toast.error(message);
    },
  });
};

// ------------------------
// Update brand (admin)
// ------------------------
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateBrandPayload) => {
      return await updateBrandApi(payload);
    },
    onSuccess: (data, variables) => {
      toast.success("برند با موفقیت به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      queryClient.invalidateQueries({ queryKey: ["admin-brand", variables.id] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در به‌روزرسانی برند")
          : "خطا در به‌روزرسانی برند";
      toast.error(message);
    },
  });
};

// ------------------------
// Delete brand (admin)
// ------------------------
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteBrandApi(id);
    },
    onSuccess: (message) => {
      toast.success(message || "برند با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در حذف برند")
          : "خطا در حذف برند";
      toast.error(message);
    },
  });
};

