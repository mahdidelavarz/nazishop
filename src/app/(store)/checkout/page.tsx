"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useCartQuery } from "@/features/cart/hooks/useCart";
import { useCreateOrder, useCreatePaymentSession } from "@/features/orders/hooks/useOrders";
import { ShippingMethod } from "@/features/orders/types/orderTypes";

const SHIPPING_OPTIONS = [
  {
    value: "standard" as ShippingMethod,
    label: "ارسال عادی",
    price: 50000,
    days: "۵-۷ روز کاری",
  },
  {
    value: "express" as ShippingMethod,
    label: "ارسال سریع",
    price: 150000,
    days: "۲-۳ روز کاری",
  },
  {
    value: "overnight" as ShippingMethod,
    label: "ارسال یک روزه",
    price: 250000,
    days: "۱ روز کاری",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartItems, isLoading } = useCartQuery();
  const createOrderMutation = useCreateOrder();
  const createPaymentMutation = useCreatePaymentSession();
  
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateSummary = () => {
    if (!cartItems || cartItems.length === 0) {
      return {
        subtotal: 0,
        discountTotal: 0,
        shippingCost: 0,
        total: 0,
      };
    }

    const subtotal = cartItems.reduce((sum, item) => {
      if (!item.products) return sum;
      return sum + item.products.price * item.quantity;
    }, 0);

    const discountTotal = cartItems.reduce((sum, item) => {
      if (!item.products) return sum;
      if (item.products.discount) {
        const discountAmount =
          item.products.price * (item.products.discount / 100);
        return sum + discountAmount * item.quantity;
      }
      return sum;
    }, 0);

    const selectedShipping = SHIPPING_OPTIONS.find(
      (opt) => opt.value === shippingMethod
    );
    const shippingCost = selectedShipping?.price || 0;

    const total = subtotal - discountTotal + shippingCost;

    return { subtotal, discountTotal, shippingCost, total };
  };

  const handleCreateOrder = async () => {
    setIsProcessing(true);

    try {
      // Create order
      const orderResponse = await createOrderMutation.mutateAsync({
        shipping_method: shippingMethod,
      });

      // Create payment session
      const paymentResponse = await createPaymentMutation.mutateAsync(
        orderResponse.order_id
      );

      // Redirect to payment
      router.push(paymentResponse.payment_url);
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="text-accent-500 mx-auto mb-4 animate-spin"
            width={48}
          />
          <p className="text-neutral-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="ph:shopping-cart-duotone"
              className="text-accent-500"
              width={64}
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            سبد خرید شما خالی است
          </h2>
          <p className="text-neutral-600 mb-8">
            برای ادامه خرید، محصولات مورد نظر خود را به سبد اضافه کنید
          </p>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition"
          >
            <Icon icon="ph:shopping-bag-duotone" width={24} />
            مشاهده محصولات
          </button>
        </div>
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">تسویه حساب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">اقلام سفارش</h2>
              <div className="space-y-4">
                {cartItems
                  .filter((item): item is typeof item & { products: NonNullable<typeof item.products> } => !!item.products)
                  .map((item) => {
                  const finalPrice = item.products.discount
                    ? item.products.price *
                      (1 - item.products.discount / 100)
                    : item.products.price;

                  const thumbnailUrl =
                    item.products.thumbnail_url &&
                    item.products.thumbnail_url.trim().length > 0
                      ? item.products.thumbnail_url
                      : null;

                  const isValidThumbnail =
                    thumbnailUrl &&
                    /^https?:\/\//i.test(thumbnailUrl);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 border-b last:border-b-0"
                    >
                      {isValidThumbnail ? (
                        <Image
                          src={thumbnailUrl as string}
                          alt={item.products.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            بدون تصویر
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {item.products.title}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          تعداد: {item.quantity}
                        </p>
                        <div className="mt-1">
                          {item.products.discount ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-foreground">
                                {finalPrice.toLocaleString("fa-IR")} تومان
                              </span>
                              <span className="text-sm text-neutral-500 line-through">
                                {item.products.price.toLocaleString("fa-IR")}
                              </span>
                              <span className="text-sm text-green-600 font-medium">
                                {item.products.discount}% تخفیف
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold text-foreground">
                              {item.products.price.toLocaleString("fa-IR")} تومان
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-semibold text-foreground">
                          {(finalPrice * item.quantity).toLocaleString("fa-IR")}{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">روش ارسال</h2>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                      shippingMethod === option.value
                        ? "border-accent-500 bg-accent-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.value}
                        checked={shippingMethod === option.value}
                        onChange={(e) =>
                          setShippingMethod(e.target.value as ShippingMethod)
                        }
                        className="w-4 h-4 text-accent-500"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {option.label}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {option.days}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      {option.price.toLocaleString("fa-IR")} تومان
                    </p>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">خلاصه سفارش</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-neutral-600">
                  <span>مجموع</span>
                  <span>{summary.subtotal.toLocaleString("fa-IR")} تومان</span>
                </div>

                {summary.discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف</span>
                    <span>
                      {summary.discountTotal.toLocaleString("fa-IR")} تومان-
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>هزینه ارسال</span>
                  <span>
                    {summary.shippingCost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-foreground mb-6">
                <span>مجموع نهایی</span>
                <span>{summary.total.toLocaleString("fa-IR")} تومان</span>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon
                      icon="eos-icons:loading"
                      className="animate-spin"
                      width={20}
                    />
                    در حال پردازش...
                  </span>
                ) : (
                  "ادامه و پرداخت"
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                با ثبت سفارش، شما شرایط و قوانین را می‌پذیرید
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}