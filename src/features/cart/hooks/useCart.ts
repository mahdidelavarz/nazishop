"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { syncGuestCart } from "../services/cartServices";
import { CartItem, CartItemPayload } from "../types/cartTypes";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLocalCartStore } from "../store/localCartStore";
import { useEffect } from "react";
import { apiClient } from "@/shared/lib/api-client";

// ------------------------
// Sync guest cart on login
// ------------------------
export const useSyncGuestCart = () => {
  const { isAuthenticated } = useAuthStore();
  const guestItems = useLocalCartStore((state) => state.items);
  const clearGuestCart = useLocalCartStore((state) => state.clear);
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && guestItems.length > 0) {
        try {
          await syncGuestCart(guestItems);
          clearGuestCart();
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          toast.success("سبد خرید شما همگام‌سازی شد");
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
    };

    syncCart();
  }, [isAuthenticated, guestItems, clearGuestCart, queryClient]);
};

// ------------------------
// Fetch cart items
// ------------------------
export const useCartQuery = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  return useQuery<CartItem[]>({
    queryKey: ["cart", user?.id],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await apiClient.get<{ success: boolean; items: CartItem[] }>("/cart");
      return response.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ------------------------
// Cart summary (lightweight)
// ------------------------
export const useCartSummary = () => {
  const { isAuthenticated, user } = useAuthStore();

  return useQuery<{ totalCount: number }>({
    queryKey: ["cart-summary", user?.id],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async () => {
      if (!user?.id) {
        return { totalCount: 0 };
      }

      const response = await apiClient.get<{ success: boolean; totalCount: number }>(
        "/cart/summary"
      );
      return { totalCount: response.data.totalCount || 0 };
    },
    staleTime: 60 * 1000,
  });
};

// ------------------------
// Add to cart
// ------------------------
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: CartItemPayload) => {
      if (!user?.id) {
        throw new Error("لطفا وارد شوید");
      }

      await apiClient.post("/cart", { productId, quantity });
    },
    onSuccess: () => {
      toast.success("محصول به سبد خرید اضافه شد");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "خطا در افزودن به سبد";
      toast.error(message);
    },
  });
};

// ------------------------
// Update cart item quantity
// ------------------------
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      if (quantity < 1) {
        throw new Error("تعداد باید حداقل ۱ باشد");
      }

      await apiClient.patch(`/cart/${cartItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "خطا در بروزرسانی تعداد";
      toast.error(message);
    },
  });
};

// ------------------------
// Remove from cart
// ------------------------
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartItemId: string) => {
      await apiClient.delete(`/cart/${cartItemId}`);
    },
    onSuccess: () => {
      toast.success("محصول از سبد حذف شد");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "خطا در حذف محصول";
      toast.error(message);
    },
  });
};