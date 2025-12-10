"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useOrderQuery, useVerifyPayment } from "@/features/orders/hooks/useOrders";

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = useMemo(() => params?.id, [params]);

  const { data: order, isLoading, isError } = useOrderQuery(orderId || "");
  const verifyPayment = useVerifyPayment();

  const handleVerify = async (success: boolean) => {
    if (!orderId) return;
    try {
      await verifyPayment.mutateAsync({ order_id: orderId, success });
      router.replace("/orders");
    } catch {
      // errors are surfaced via toast in hook
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">شناسه سفارش نامعتبر است.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon
          icon="eos-icons:loading"
          className="text-accent-500 animate-spin"
          width={40}
        />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">سفارش یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
            <Icon icon="ph:credit-card-duotone" className="text-accent-500" width={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">پرداخت سفارش</h1>
            <p className="text-neutral-500 text-sm">شناسه سفارش: {order.id}</p>
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-neutral-700">
            <span>مبلغ سفارش</span>
            <span className="font-semibold text-foreground">
              {order.total.toLocaleString("fa-IR")} تومان
            </span>
          </div>
          <div className="flex justify-between text-neutral-600 text-sm">
            <span>روش ارسال</span>
            <span>{order.shipping_method}</span>
          </div>
          <div className="flex justify-between text-neutral-600 text-sm">
            <span>وضعیت فعلی</span>
            <span>{order.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleVerify(true)}
            disabled={verifyPayment.isPending}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition"
          >
            {verifyPayment.isPending ? (
              <Icon icon="eos-icons:loading" className="animate-spin" width={18} />
            ) : (
              <Icon icon="ph:check-circle-duotone" width={20} />
            )}
            پرداخت موفق
          </button>
          <button
            onClick={() => handleVerify(false)}
            disabled={verifyPayment.isPending}
            className="flex items-center justify-center gap-2 bg-neutral-100 text-neutral-800 py-3 rounded-xl font-bold hover:bg-neutral-200 disabled:opacity-50 transition"
          >
            <Icon icon="ph:x-circle-duotone" width={20} />
            پرداخت ناموفق
          </button>
        </div>

        <p className="text-xs text-neutral-500 text-center">
          در صورت بروز مشکل می‌توانید بعداً از بخش سفارش‌ها وضعیت را بررسی کنید.
        </p>
      </div>
    </div>
  );
}