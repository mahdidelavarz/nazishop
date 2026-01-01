"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useOrderQuery } from "@/features/orders/hooks/useOrders";
import { OrderStatus } from "@/features/orders/types/orderTypes";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

const STATUS_TIMELINE = [
  { key: "pending", label: "ثبت سفارش", icon: "ph:note-duotone" },
  { key: "paid", label: "پرداخت تأیید شد", icon: "ph:check-circle-duotone" },
  { key: "shipped", label: "ارسال شده", icon: "ph:truck-duotone" },
  { key: "delivered", label: "تحویل داده شده", icon: "ph:confetti-duotone" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useOrderQuery(orderId);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment) {
      setPaymentStatus(payment);
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }, [searchParams]);

  const getStatusIndex = (status: string): number => {
    if (status === "cancelled") return -1;
    return STATUS_TIMELINE.findIndex((s) => s.key === status);
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
          <p className="text-neutral-600">در حال بارگذاری جزئیات سفارش...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon
            icon="ph:warning-duotone"
            className="text-error mx-auto mb-4"
            width={64}
          />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {error?.message || "سفارش یافت نشد"}
          </h2>
          <Link
            href="/orders"
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-600 mb-4"
          >
            <Icon icon="ph:arrow-right" width={20} />
            بازگشت به سفارش‌ها
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                سفارش #{orderId.slice(0, 8)}
              </h1>
              <p className="text-neutral-600 mt-1">
                ثبت شده در{" "}
                {new Date(order.created_at).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                STATUS_COLORS[order.status as OrderStatus]
              }`}
            >
              {STATUS_LABELS[order.status as OrderStatus]}
            </span>
          </div>
        </div>

        {/* Payment Status Alert */}
        {paymentStatus === "success" && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
            <Icon icon="ph:check-circle-duotone" width={24} />
            پرداخت با موفقیت انجام شد! سفارش شما تأیید شد.
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
            <Icon icon="ph:x-circle-duotone" width={24} />
            پرداخت ناموفق بود. سفارش شما در حالت در انتظار باقی ماند.
          </div>
        )}

        {/* Order Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">وضعیت سفارش</h2>
            <div className="relative">
              <div className="flex justify-between">
                {STATUS_TIMELINE.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1 relative"
                    >
                      {index < STATUS_TIMELINE.length - 1 && (
                        <div
                          className={`absolute top-6 right-1/2 w-full h-0.5 ${
                            index < currentStatusIndex
                              ? "bg-accent-500"
                              : "bg-gray-200"
                          }`}
                          style={{ zIndex: 0 }}
                        />
                      )}

                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 relative z-10 ${
                          isCompleted
                            ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-accent-200" : ""}`}
                      >
                        <Icon icon={step.icon} width={24} />
                      </div>

                      <p
                        className={`text-sm text-center font-medium ${
                          isCompleted ? "text-foreground" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.tracking_code && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-neutral-600 mb-1">کد رهگیری</p>
                <p className="text-lg font-mono font-semibold text-foreground">
                  {order.tracking_code}
                </p>
              </div>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:x-circle-duotone" className="text-red-600" width={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  سفارش لغو شده
                </h3>
                <p className="text-red-700">
                  این سفارش لغو شده و پردازش نخواهد شد.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">اقلام سفارش</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const finalPrice = item.products?.discount
                    ? item.products?.price *
                      (1 - item.products.discount / 100)
                    : item.products?.price;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 border-b last:border-b-0"
                    >
                      {item.products?.thumbnail_url ? (
                        <Image
                          src={item.products?.thumbnail_url}
                          alt={item.products?.title}
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
                          {item.products?.title}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          تعداد: {item.quantity}
                        </p>
                        <div className="mt-1">
                          {item.products?.discount ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-foreground">
                                {finalPrice?.toLocaleString("fa-IR")} تومان
                              </span>
                              <span className="text-sm text-neutral-500 line-through">
                                {item.products?.price.toLocaleString("fa-IR")}
                              </span>
                              <span className="text-sm text-green-600 font-medium">
                                {item.products?.discount}% تخفیف
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold text-foreground">
                              {item.products?.price.toLocaleString("fa-IR")}{" "}
                              تومان
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="text-lg font-semibold text-foreground">
                          {(finalPrice ? finalPrice * item.quantity : 0).toLocaleString("fa-IR")}{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address (from order snapshot) */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">آدرس ارسال</h2>
              <div className="text-neutral-700">
                <p className="font-medium">{order.shipping_full_name}</p>
                {order.shipping_phone && (
                  <p className="text-sm text-neutral-500 mb-2">{order.shipping_phone}</p>
                )}
                <p>{order.shipping_address_line}</p>
                <p>
                  {[order.shipping_city, order.shipping_state, order.shipping_postal_code]
                    .filter(Boolean)
                    .join("، ")}
                </p>
                {order.shipping_country && <p>{order.shipping_country}</p>}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">خلاصه سفارش</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-neutral-600">
                  <span>مجموع</span>
                  <span>{order.total.toLocaleString("fa-IR")} تومان</span>
                </div>

                {order.items.reduce((sum, item) => {
                  if (!item.products) return sum;
                  return sum + (item.products.discount ? item.products.discount * item.quantity : 0);
                }, 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف</span>
                    <span>
                      {order.items.reduce((sum, item) => {
                        if (!item.products) return sum;
                        return sum + (item.products.discount ? item.products.discount * item.quantity : 0);
                      }, 0).toLocaleString("fa-IR")} تومان-
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>هزینه ارسال ({order.shipping_method})</span>
                  <span>
                    {order.shipping_cost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-foreground mb-6">
                <span>مجموع نهایی</span>
                <span>{order.total.toLocaleString("fa-IR")} تومان</span>
              </div>

              {order.status === "pending" && (
                <Link
                  href="/checkout"
                  className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
                >
                  تکمیل پرداخت
                </Link>
              )}

              {order.status === "pending" && (
                <Link
                  href={`/payment/${order.id}`}
                  className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
                >
                  ادامه پرداخت
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}