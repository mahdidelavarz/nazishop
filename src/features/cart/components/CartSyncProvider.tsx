// features/cart/components/CartSyncProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLocalCartStore } from "../store/localCartStore";
import { syncGuestCart } from "../services/cartServices";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const guestItems = useLocalCartStore((state) => state.items);
  const clearGuestCart = useLocalCartStore((state) => state.clear);
  const queryClient = useQueryClient();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncCart = async () => {
      // Only sync once when user logs in and has guest items
      if (isAuthenticated && guestItems.length > 0 && !hasSynced.current) {
        hasSynced.current = true;
        
        // Wait a bit more for auth state to fully settle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await toast.promise(
            syncGuestCart(guestItems),
            {
              loading: "در حال همگام‌سازی سبد خرید...",
              success: (result) => {
                // Clear guest cart after successful sync
                clearGuestCart();
                queryClient.invalidateQueries({ queryKey: ["cart"] });
                return `${guestItems.length} محصول به سبد خرید شما اضافه شد`;
              },
              error: (err) => {
                hasSynced.current = false; // Allow retry on error
                return err.message || "خطا در همگام‌سازی سبد خرید";
              },
            }
          );
        } catch (error: any) {
          console.error("Failed to sync cart:", error);
          hasSynced.current = false; // Allow retry on error
        }
      }
    };

    syncCart();
  }, [isAuthenticated, guestItems.length]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasSynced.current = false;
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}