"use client";

import { useAuth } from "@/shared/providers/AuthProvider";
import LogoutButton from "@/shared/ui/logoutButton";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div dir="rtl" className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">فروشگاه آرایشی</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span>خوش آمدی، {user.email}</span>
            <Link
              href="/profile"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              پروفایل
            </Link>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              href="/login"
              className="bg-pink-500 text-white px-4 py-2 rounded-md"
            >
              ورود
            </Link>
            <Link
              href="/signup"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              ثبت‌نام
            </Link>
          </div>
        )}
      </header>

      <section className="text-center space-y-4">
        <h2 className="text-xl font-semibold">
          به فروشگاه آرایشی ما خوش آمدید 💄
        </h2>
        <p>
          اینجا می‌توانید جدیدترین محصولات آرایشی و بهداشتی را مشاهده کنید و
          خریدی راحت و مطمئن داشته باشید.
        </p>
        <Link
          href="/products"
          className="bg-pink-500 text-white px-6 py-3 rounded-md inline-block mt-4"
        >
          مشاهده محصولات
        </Link>
      </section>
      <LogoutButton />
    </div>
  );
}
