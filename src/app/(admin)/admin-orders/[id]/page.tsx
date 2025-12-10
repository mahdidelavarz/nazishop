"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useOrderQuery, useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";
import { OrderStatus } from "@/features/orders/types/orderTypes";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "در انتظار" },
  { value: "paid", label: "پرداخت شده" },
  { value: "shipped", label: "ارسال شده" },
  { value: "delivered", label: "تحویل داده شده" },
  { value: "cancelled", label: "لغو شده" },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, refetch } = useOrderQuery(orderId);
  const updateStatusMutation = useUpdateOrderStatus();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status as OrderStatus);
      setTrackingCode(order.tracking_code || "");
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!order || selectedStatus === order.status) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        payload: {
          status: selectedStatus,
          tracking_code: trackingCode || undefined,
        },
      });
      refetch();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon
            icon="ph:warning-duotone"
            className="text-error mx-auto mb-4"
            width={64}
          />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            سفارش یافت نشد
          </h2>
          <Link
            href="/admin-orders"
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  const allowedStatuses = STATUS_TRANSITIONS[order.status] || [];
  const canUpdateStatus = allowedStatuses.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin-orders"
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
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">اطلاعات مشتری</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">نام</p>
                  <p className="font-medium text-foreground">
                    {order.users.full_name}

                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">ایمیل</p>
                  <p className="font-medium text-foreground">
                    {order.users.email}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-neutral-600 mb-1">آدرس ارسال</p>
                  <p className="font-medium text-foreground">
                    {order.users.address}
                    <br />
                    {order.users.city}, {order.users.state}{" "}
                    {order.users.postal_code}
                    <br />
                    {order.users.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">اقلام سفارش</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const finalPrice = item.products?.discount
                    ? item.products?.price *
                      (1 - item.products?.discount / 100)
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
                          تعداد: {item.quantity} × {finalPrice?.toLocaleString("fa-IR")} تومان
                        </p>
                        {item.products?.discount && (
                          <p className="text-sm text-green-600">
                            تخفیف: {item.products?.discount}%
                          </p>
                        )}
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Status Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">به‌روزرسانی وضعیت</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    وضعیت فعلی
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-foreground font-medium">
                    {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                  </div>
                </div>

                {canUpdateStatus && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        وضعیت جدید
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as OrderStatus)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      >
                        <option value={order.status}>
                          {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                        </option>
                        {allowedStatuses.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(selectedStatus === "shipped" ||
                      order.status === "shipped") && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          کد رهگیری
                        </label>
                        <input
                          type="text"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          placeholder="کد رهگیری را وارد کنید"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleUpdateStatus}
                      disabled={
                        updateStatusMutation.isPending ||
                        selectedStatus === order.status
                      }
                      className="w-full bg-accent-500 text-white py-2 rounded-lg font-semibold hover:bg-accent-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {updateStatusMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Icon
                            icon="eos-icons:loading"
                            className="animate-spin"
                            width={20}
                          />
                          در حال به‌روزرسانی...
                        </span>
                      ) : (
                        "به‌روزرسانی وضعیت"
                      )}
                    </button>
                  </>
                )}

                {!canUpdateStatus && order.status !== "cancelled" && (
                  <p className="text-sm text-neutral-600">
                    این سفارش به وضعیت نهایی رسیده و قابل تغییر نیست.
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
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
                    {order.users.shipping_cost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-foreground">
                <span>مجموع نهایی</span>
                <span>{order.total.toLocaleString("fa-IR")} تومان</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">جزئیات سفارش</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neutral-600">شناسه سفارش:</span>
                  <p className="font-mono text-foreground">{order.id}</p>
                </div>
                <div>
                  <span className="text-neutral-600">شناسه کاربر:</span>
                  <p className="font-mono text-foreground">{order.user_id}</p>
                </div>
                <div>
                  <span className="text-neutral-600">تاریخ ثبت:</span>
                  <p className="text-foreground">
                    {new Date(order.created_at).toLocaleString("fa-IR")}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">آخرین به‌روزرسانی:</span>
                  <p className="text-foreground">
                    {new Date(order.updated_at || "").toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}