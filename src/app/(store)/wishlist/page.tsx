"use client";

import { useWishlistQuery } from "@/features/wishlist/hooks/useWishlist";
import WishlistItem from "@/features/wishlist/components/WishlistItem";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function WishlistPage() {
  const { data: items, isLoading, error } = useWishlistQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="text-accent-500 mx-auto mb-4 animate-spin"
            width={48}
          />
          <p className="text-neutral-600">در حال بارگذاری لیست علاقه‌مندی‌ها...</p>
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
            خطا در بارگذاری لیست علاقه‌مندی‌ها
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

  const wishlistItems = items || [];
  const isEmpty = wishlistItems.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="ph:heart-duotone" className="text-accent-500" width={64} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              لیست علاقه‌مندی‌های شما خالی است
            </h2>
            <p className="text-neutral-600 mb-8">
              محصولاتی که دوست دارید را با کلیک روی آیکون قلب به این لیست اضافه کنید
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
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              لیست علاقه‌مندی‌ها
            </h1>
            <p className="text-neutral-600">
              {wishlistItems.length} محصول در لیست علاقه‌مندی‌های شما
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-neutral-700 hover:text-accent-500 transition"
          >
            <Icon icon="ph:arrow-right" width={20} />
            <span className="hidden sm:inline">ادامه خرید</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlistItems.map((item) => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}


