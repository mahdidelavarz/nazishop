"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  fetchCategoriesApi,
  fetchAdminCategoriesApi,
  fetchAdminCategoryApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../services/categoryService";
import {
  Category,
  CategoryWithCount,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/categoryTypes";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ------------------------
// Fetch categories (public)
// ------------------------
export const useCategories = () => {
  return useQuery<CategoryWithCount[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      return await fetchCategoriesApi();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ------------------------
// Fetch categories (admin)
// ------------------------
export const useAdminCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      return await fetchAdminCategoriesApi();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ------------------------
// Fetch single category (admin)
// ------------------------
export const useAdminCategory = (id: string | null) => {
  return useQuery<Category>({
    queryKey: ["admin-category", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Category ID is required");
      return await fetchAdminCategoryApi(id);
    },
  });
};

// ------------------------
// Create category (admin)
// ------------------------
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      return await createCategoryApi(payload);
    },
    onSuccess: (data) => {
      toast.success("دسته‌بندی با موفقیت ایجاد شد");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در ایجاد دسته‌بندی")
          : "خطا در ایجاد دسته‌بندی";
      toast.error(message);
    },
  });
};

// ------------------------
// Update category (admin)
// ------------------------
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCategoryPayload) => {
      return await updateCategoryApi(payload);
    },
    onSuccess: (data, variables) => {
      toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-category", variables.id] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در به‌روزرسانی دسته‌بندی")
          : "خطا در به‌روزرسانی دسته‌بندی";
      toast.error(message);
    },
  });
};

// ------------------------
// Delete category (admin)
// ------------------------
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteCategoryApi(id);
    },
    onSuccess: (message) => {
      toast.success(message || "دسته‌بندی با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در حذف دسته‌بندی")
          : "خطا در حذف دسته‌بندی";
      toast.error(message);
    },
  });
};

