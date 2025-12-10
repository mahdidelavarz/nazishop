"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useOrdersQuery } from "@/features/orders/hooks/useOrders";
import { OrderStatus } from "@/features/orders/types/orderTypes";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

const formatDate = (value: string) => {
  const formatter = new Intl.DateTimeFormat("fa-IR", { timeZone: "UTC" });
  return formatter.format(new Date(value));
};

export default function AdminOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data, isLoading, error } = useOrdersQuery({
    page: currentPage,
    limit: 20,
    status: selectedStatus || undefined,
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const counts = useMemo(() => {
    return orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                مدیریت سفارش‌ها
              </h1>
              <p className="text-neutral-600">
                مدیریت و پیگیری تمام سفارش‌های مشتریان
              </p>
            </div>
            <Link
              href="/admin-dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              بازگشت به پنل
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error.message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-neutral-600 mb-1">کل سفارش‌ها</p>
            <p className="text-2xl font-bold text-foreground">
              {pagination?.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-neutral-600 mb-1">ارسال شده</p>
            <p className="text-2xl font-bold text-purple-600">
              {counts["shipped"] || 0}
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedStatus === ""
                  ? "bg-accent-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              همه ({pagination?.total || 0})
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
        {/* Orders Table */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Icon
              icon="ph:package-duotone"
              className="text-gray-400 mx-auto mb-4"
              width={64}
            />
            <p className="text-neutral-600">سفارشی یافت نشد</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      شناسه سفارش
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      مشتری
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      مبلغ کل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      تاریخ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-foreground">
                          #{order.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.users ? (
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {order.users.full_name || "—"}
                            </div>
                            <div className="text-neutral-500">
                              {order.users.email || ""}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-500">—</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          {order.total.toLocaleString("fa-IR")} تومان
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            STATUS_COLORS[order.status as OrderStatus]
                          }`}
                        >
                          {STATUS_LABELS[order.status as OrderStatus]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <Link
                          href={`/admin-orders/${order.id}`}
                          className="text-accent-500 hover:text-accent-600"
                        >
                          مشاهده جزئیات
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-neutral-700">
                  صفحه {pagination.page} از {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    قبلی
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
