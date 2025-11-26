"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { 
  addToCartApi, 
  fetchCartItems, 
  removeCartItem, 
  updateCartItemQuantity,
  syncGuestCart 
} from "../services/cartServices";
import { CartItem, CartItemPayload } from "../types/cartTypes";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLocalCartStore } from "../store/localCartStore";
import { useEffect } from "react";

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
  }, [isAuthenticated, guestItems.length]);
};

// ------------------------
// Fetch cart items
// ------------------------
export const useCartQuery = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: fetchCartItems,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

// ------------------------
// Add to cart
// ------------------------
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CartItemPayload) => addToCartApi(payload),
    onSuccess: () => {
      toast.success("محصول به سبد خرید اضافه شد");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در افزودن به سبد");
    },
  });
};

// ------------------------
// Update cart item quantity
// ------------------------
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartItemQuantity(cartItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در بروزرسانی تعداد");
    },
  });
};

// ------------------------
// Remove from cart
// ------------------------
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartItemId: string) => removeCartItem(cartItemId),
    onSuccess: () => {
      toast.success("محصول از سبد حذف شد");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در حذف محصول");
    },
  });
};