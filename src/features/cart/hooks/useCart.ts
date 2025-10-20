"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  addToCartApi,
  fetchCartItems,
  removeCartItem,
} from "../services/cartServices";
import { CartItem } from "../types/cartTypes";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLocalCartStore } from "../store/localCartStore";
import { supabase } from "@/shared/lib/supabase";
import { Product } from "@/features/products/types/productsType";

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
export function useAddToCart() {
  const user = useAuthStore((s) => s.user);
  const localCart = useLocalCartStore();

  return useMutation({
    mutationFn: async ({
      product,
      quantity,
    }: {
      product: Product;
      quantity: number;
    }) => {
      if (!user) {
        // Guest user → store locally
        localCart.addItem({
          id: crypto.randomUUID(),
          product_id: product.id,
          quantity,
          products: product,
        });
        toast.success("محصول به سبد خرید اضافه شد");
        return;
      }

      // Logged-in user → send to Supabase
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        quantity,
      });

      if (error) {
        toast.error(`خطا در افزودن به سبد خرید: ${error.message}`);
        throw error;
      }

      toast.success("محصول با موفقیت به سبد خرید اضافه شد");
    },
  });
}
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
