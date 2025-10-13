"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useCart(userId?: string) {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(id, title, price, thumbnail_url)")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      if (!userId) throw new Error("Not logged in");
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (existing) {
        return supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      }

      return supabase
        .from("cart_items")
        .insert({ user_id: userId, product_id: productId, quantity: 1 });
    },
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  const removeFromCart = useMutation({
    mutationFn: async (id: string) => {
      return supabase.from("cart_items").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  return { ...cartQuery, addToCart, removeFromCart };
}
