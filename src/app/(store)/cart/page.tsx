"use client";

import { useCartQuery, useRemoveCartItem } from "@/features/cart/hooks/useCart";
import Link from "next/link";

export default function CartPage() {
  const { data: cartItems, isLoading, error } = useCartQuery();
  const { mutate: removeItem, isPending: removing } = useRemoveCartItem();

  if (isLoading)
    return (
      <p className="text-center py-10 text-gray-500">
        در حال بارگذاری سبد خرید...
      </p>
    );
  if (error)
    return (
      <p className="text-center py-10 text-red-500">خطا در بارگذاری سبد خرید</p>
    );

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">سبد خرید شما خالی است.</p>
        <Link
          href="/products"
          className="text-blue-500 underline mt-4 inline-block"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * (item.products?.price || 0),
    0
  );

  return (
    <div dir="rtl" className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">سبد خرید</h1>

      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.products?.thumbnail_url || "/no-image.jpg"}
                alt={item.products?.title}
                className="w-20 h-20 object-cover rounded-md border"
              />
              <div>
                <h2 className="font-semibold">{item.products?.title}</h2>
                <p className="text-gray-500 text-sm">
                  تعداد: {item.quantity} ×{" "}
                  {item.products?.price.toLocaleString()} تومان
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-bold text-pink-600">
                {(item.products?.price || 0 * item.quantity).toLocaleString()}{" "}
                تومان
              </span>
              <button
                onClick={() => removeItem(item.id)}
                disabled={removing}
                className="text-red-500 hover:underline text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <span className="font-bold text-lg">جمع کل:</span>
        <span className="font-bold text-pink-600 text-lg">
          {totalPrice.toLocaleString()} تومان
        </span>
      </div>

      <button
        disabled={cartItems.length === 0}
        className="mt-6 w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold"
      >
        ادامه به پرداخت
      </button>
    </div>
  );
}
