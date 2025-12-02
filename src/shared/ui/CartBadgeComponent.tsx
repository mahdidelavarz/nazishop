// shared/components/CartBadge.tsx
"use client";

import { useCartSummary } from "@/features/cart/hooks/useCart";
import { useLocalCartStore } from "@/features/cart/store/localCartStore";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function CartBadge() {
  const { isAuthenticated } = useAuthStore();
  const { data: cartSummary } = useCartSummary();
  const guestItems = useLocalCartStore((state) => state.items);

  // Get total count from appropriate source
  const totalCount = isAuthenticated
    ? cartSummary?.totalCount ?? 0
    : guestItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link
      href={isAuthenticated ? "/cart" : "/login?redirectedFrom=/cart"}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition"
    >
      <Icon icon="ph:shopping-cart-duotone" width={24} />
      {totalCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {totalCount > 9 ? "9+" : totalCount}
        </span>
      )}
    </Link>
  );
}