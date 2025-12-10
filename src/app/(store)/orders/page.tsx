"use client";

import { useState } from "react";
import { useOrdersQuery } from "@/features/orders/hooks/useOrders";
import { Icon } from "@iconify/react";
import Link from "next/link";
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

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data, isLoading, error } = useOrdersQuery({
    page: currentPage,
    limit: 10,
    status: selectedStatus || undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="text-accent-500 mx-auto mb-4 animate-spin"
            width={48}
          />
          <p className="text-neutral-600">در حال بارگذاری سفارش‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon
            icon="ph:warning-duotone"
            className="text-error mx-auto mb-4"
            width={64}
          />
          <h3 className="text-xl font-bold text-foreground mb-2">
            خطا در بارگذاری سفارش‌ها
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination;
  const isEmpty = orders.length === 0;

  if (isEmpty && !selectedStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="ph:shopping-bag-duotone"
                className="text-accent-500"
                width={64}
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              هنوز سفارشی ثبت نکرده‌اید
            </h2>
            <p className="text-neutral-600 mb-8">
              محصولات مورد نظر خود را به سبد خرید اضافه کنید و اولین سفارش خود را
              ثبت کنید
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                سفارش‌های من
              </h1>
              <p className="text-neutral-600">
                {pagination?.total || 0} سفارش ثبت شده
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 text-neutral-700 hover:text-accent-500 transition"
            >
              <span className="hidden sm:inline">ادامه خرید</span>
              <Icon icon="ph:arrow-left" width={20} />
            </Link>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedStatus === ""
                  ? "bg-accent-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              همه سفارش‌ها
            </button>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSelectedStatus(value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedStatus === value
                    ? "bg-accent-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isEmpty ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Icon
              icon="ph:magnifying-glass-duotone"
              className="text-gray-400 mx-auto mb-4"
              width={64}
            />
            <h3 className="text-xl font-bold text-foreground mb-2">
              سفارشی با این وضعیت یافت نشد
            </h3>
            <p className="text-neutral-600 mb-6">
              فیلتر را تغییر دهید یا سفارش جدیدی ثبت کنید
            </p>
            <button
              onClick={() => setSelectedStatus("")}
              className="text-accent-500 hover:text-accent-600 font-medium"
            >
              نمایش همه سفارش‌ها
            </button>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-md transition p-6 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          سفارش #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString(
                            "fa-IR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          STATUS_COLORS[order.status as OrderStatus]
                        }`}
                      >
                        {STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-foreground">
                          {order.total.toLocaleString("fa-IR")} تومان
                        </p>
                        
                      </div>
                      <div className="text-left">
                        <span className="text-accent-500 hover:text-accent-600 font-medium flex items-center gap-2">
                          مشاهده جزئیات
                          <Icon icon="ph:arrow-left" width={20} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  قبلی
                </button>

                <div className="flex gap-2">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        currentPage === page
                          ? "bg-accent-500 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}