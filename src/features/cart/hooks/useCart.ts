"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addToCartApi, fetchCartItems, removeCartItem } from "../services/cartServices";
import { CartItem, CartItemPayload } from "../types/cartTypes";
import { useAuthStore } from "@/features/auth/store/authStore";


// ------------------------
// Fetch cart items
// ------------------------
export const useCartQuery = () => {
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: fetchCartItems,
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
      toast.error(`خطا در افزودن به سبد: ${error.message}`);
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
      toast.error(`خطا در حذف محصول: ${error.message}`);
    },
  });
};
