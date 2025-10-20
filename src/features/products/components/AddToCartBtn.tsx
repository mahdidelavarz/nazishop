"use client";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useState } from "react";
import { Product } from "../types/productsType";

interface AddToCartButtonProps {
  product: Product;
  stock: number;
}

export default function AddToCartButton({
  product,
  stock,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { mutate: addToCart, isPending } = useAddToCart();

  const handleAddToCart = () => {
    if (stock <= 0) return;
    addToCart({ product, quantity });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          +
        </button>
      </div>

      <button
        disabled={isPending || stock <= 0}
        onClick={handleAddToCart}
        className={`w-full py-3 rounded-lg font-bold text-white ${
          stock > 0
            ? "bg-pink-600 hover:bg-pink-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isPending ? "در حال افزودن..." : "افزودن به سبد خرید"}
      </button>
    </div>
  );
}
