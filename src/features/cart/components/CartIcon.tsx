"use client";
import Link from "next/link";
import { useCartSummary } from "../hooks/useCart";

export function CartIcon() {
  const { data: cartSummary } = useCartSummary();
  const count = cartSummary?.totalCount ?? 0;

  return (
    <Link href="/cart" className="relative">
      {/* <ShoppingCart className="w-6 h-6" /> */}
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
