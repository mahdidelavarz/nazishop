"use client";

import { useCartQuery, useRemoveCartItem, useUpdateCartItem } from "@/features/cart/hooks/useCart";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { data: cartItems, isLoading, error } = useCartQuery();
  const { mutate: removeItem, isPending: removing } = useRemoveCartItem();
  const { mutate: updateQuantity, isPending: updating } = useUpdateCartItem();

  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push("/login?redirectedFrom=/cart");
  //   }
  // }, [isLoading, isAuthenticated, router]);

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
  //       <div className="text-center">
  //         <Icon icon="eos-icons:loading" className="text-pink-500 mx-auto mb-4" width={48} />
  //         <p className="text-gray-600">در حال بررسی احراز هویت...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="text-pink-500 mx-auto mb-4" width={48} />
          <p className="text-gray-600">در حال بارگذاری سبد خرید...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon icon="ph:warning-duotone" className="text-red-500 mx-auto mb-4" width={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">خطا در بارگذاری سبد خرید</h3>
          <button
            onClick={() => window.location.reload()}
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !cartItems || cartItems.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="ph:shopping-cart-duotone" className="text-pink-500" width={64} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">سبد خرید شما خالی است</h2>
            <p className="text-gray-600 mb-8">
              هنوز محصولی به سبد خرید خود اضافه نکرده‌اید
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition"
            >
              <Icon icon="ph:shopping-bag-duotone" width={24} />
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * (item.products?.price || 0),
    0
  );

  const totalItems = cartItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">سبد خرید</h1>
              <p className="text-gray-600">
                {totalItems} محصول در سبد خرید شما
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition"
            >
              <Icon icon="ph:arrow-right" width={20} />
              <span className="hidden sm:inline">ادامه خرید</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const itemTotal = (item.products?.price || 0) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/products/${(item.products as { slug?: string })?.slug}`}
                      className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 hover:opacity-80 transition"
                    >
                      {item.products?.thumbnail_url ? (
                        <Image
                          src={
                            item.products.thumbnail_url.startsWith("/")
                              ? item.products.thumbnail_url
                              : `/${item.products.thumbnail_url}`
                          }
                          alt={item.products?.title || ""}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon icon="ph:image-duotone" className="text-gray-300" width={32} />
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${(item.products as { slug?: string })?.slug}`}
                        className="font-bold text-gray-900 hover:text-pink-600 transition line-clamp-2 mb-2"
                      >
                        {item.products?.title}
                      </Link>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity({
                                  cartItemId: item.id,
                                  quantity: item.quantity - 1,
                                });
                              }
                            }}
                            disabled={updating || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white transition disabled:opacity-50"
                          >
                            <Icon icon="ph:minus-bold" width={16} />
                          </button>

                          <span className="w-8 text-center font-bold">{item.quantity}</span>

                          <button
                            onClick={() => {
                              updateQuantity({
                                cartItemId: item.id,
                                quantity: item.quantity + 1,
                              });
                            }}
                            disabled={updating}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white transition disabled:opacity-50"
                          >
                            <Icon icon="ph:plus-bold" width={16} />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-left">
                          <p className="font-bold text-pink-600 text-lg mb-1">
                            {itemTotal.toLocaleString()} تومان
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={removing}
                            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 disabled:opacity-50"
                          >
                            <Icon icon="ph:trash-duotone" width={16} />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">خلاصه سفارش</h2>

              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>جمع جزء ({totalItems} محصول)</span>
                  <span className="font-medium">{totalPrice.toLocaleString()} تومان</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال</span>
                  <span className="font-medium text-green-600">رایگان</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">مبلغ قابل پرداخت:</span>
                <span className="font-extrabold text-2xl text-pink-600">
                  {totalPrice.toLocaleString()} تومان
                </span>
              </div>

              <button
                disabled={cartItems.length === 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-xl text-white font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="ph:credit-card-duotone" width={24} />
                ادامه و پرداخت
              </button>

              {/* Features */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon icon="ph:shield-check-duotone" className="text-green-500" width={20} />
                  <span>پرداخت امن</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon icon="ph:truck-duotone" className="text-blue-500" width={20} />
                  <span>ارسال سریع</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon icon="ph:arrow-counter-clockwise-duotone" className="text-purple-500" width={20} />
                  <span>ضمانت بازگشت</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}