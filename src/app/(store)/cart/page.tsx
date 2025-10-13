"use client";
import Image from "next/image";
import { useCart } from "./hooks/useCart";
import { useAuth } from "@/providers/AuthProvider";

export default function CartPage() {
  const user = useAuth();
  const { data: cart, isLoading, removeFromCart } = useCart(user?.id);

  if (isLoading) return <div>Loading...</div>;
  if (!cart?.length) return <div>Your cart is empty.</div>;

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      {cart.map((item) => (
        <div key={item.id} className="flex items-center gap-4 border p-2 rounded">
          <Image
            src={item.product.thumbnail_url}
            alt={item.product.title}
            width={60}
            height={60}
            className="rounded"
          />
          <div className="flex-1">
            <h2>{item.product.title}</h2>
            <p>${item.product.price}</p>
          </div>
          <p>x{item.quantity}</p>
          <button
            className="text-red-500"
            onClick={() => removeFromCart.mutate(item.id)}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex justify-between font-semibold pt-4">
        <p>Total:</p>
        <p>${total.toFixed(2)}</p>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4">
        Checkout
      </button>
    </div>
  );
}
