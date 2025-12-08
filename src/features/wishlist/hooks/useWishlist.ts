"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  fetchWishlist,
  addToWishlistApi,
  removeFromWishlistApi,
  fetchWishlistSummary,
} from "../services/wishlistService";
import { WishlistItem } from "../types/wishlistTypes";
import { useWishlistStore } from "../store/wishlistStore";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ------------------------
// Fetch full wishlist
// ------------------------
export const useWishlistQuery = () => {
  const { isAuthenticated, user } = useAuthStore();
  // const setWishlistIds = useWishlistStore((state) => state.setWishlistIds);

  return useQuery<WishlistItem[]>({
    queryKey: ["wishlist", user?.id],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async () => {
      const response = await fetchWishlist();
      const items = response.items || [];
      // setWishlistIds(items.map((item) => item.product_id));
      return items;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ------------------------
// Lightweight summary (count)
// ------------------------
export const useWishlistSummary = () => {
  const { isAuthenticated, user } = useAuthStore();

  return useQuery<number>({
    queryKey: ["wishlist-summary", user?.id],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async () => {
      const response = await fetchWishlistSummary();
      return response;
    },
    staleTime: 60 * 1000,
  });
};

// ------------------------
// Add to wishlist
// ------------------------
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  // const addToWishlist = useWishlistStore((state) => state.addToWishlist);

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await addToWishlistApi({ productId });
      return response;
    },
    onSuccess: (data, productId) => {
      // addToWishlist(productId);
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("به لیست علاقه‌مندی‌ها اضافه شد");
      }
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-summary"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error ?
            ((error as ApiError).response?.data?.message ??
              (error as ApiError).message ??
              "خطا در افزودن به علاقه‌مندی‌ها")
          : "خطا در افزودن به علاقه‌مندی‌ها";
      toast.error(message);
    },
  });
};

// ------------------------
// Remove from wishlist
// ------------------------
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await removeFromWishlistApi(productId);
      return response;
    },
    onSuccess: (data, productId) => {
      removeFromWishlist(productId);
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("از لیست علاقه‌مندی‌ها حذف شد");
      }
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-summary"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error ?
            ((error as ApiError).response?.data?.message ??
              (error as ApiError).message ??
              "خطا در حذف از علاقه‌مندی‌ها")
          : "خطا در حذف از علاقه‌مندی‌ها";
      toast.error(message);
    },
  });
};

// ------------------------
// Local helper hook
// ------------------------
export const useIsInWishlist = (productId: string | undefined) => {
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  if (!productId) return false;
  return isInWishlist(productId);
};
