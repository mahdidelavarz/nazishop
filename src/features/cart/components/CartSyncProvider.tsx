// features/cart/components/CartSyncProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLocalCartStore } from "../store/localCartStore";
import { syncGuestCart } from "../services/cartServices";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const guestItems = useLocalCartStore((state) => state.items);
  const clearGuestCart = useLocalCartStore((state) => state.clear);
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && guestItems.length > 0) {
        try {
          const syncPromise = syncGuestCart(guestItems);
          
          await toast.promise(syncPromise, {
            loading: "در حال همگام‌سازی سبد خرید...",
            success: `${guestItems.length} محصول به سبد خرید شما اضافه شد`,
            error: "خطا در همگام‌سازی سبد خرید",
          });

          clearGuestCart();
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
    };

    syncCart();
  }, [isAuthenticated]);

  return <>{children}</>;
}