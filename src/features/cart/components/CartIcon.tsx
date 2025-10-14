"use client";
import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { useAuth } from "@/shared/providers/AuthProvider";

export function CartIcon() {
  const user = useAuth();
  const { data: cart } = useCart(user?.id);

  return (
    <Link href="/cart" className="relative">
      {/* <ShoppingCart className="w-6 h-6" /> */}
      {cart?.length ? (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          {cart.length}
        </span>
      ) : null}
    </Link>
  );
}
