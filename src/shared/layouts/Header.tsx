// components/layout/Header.tsx

"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
              <Icon icon="mdi:lipstick" className="text-white" width={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                گلامور شاپ
              </h1>
              <p className="text-xs text-gray-500">زیبایی در هر لحظه</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-pink-500 font-medium transition"
            >
              محصولات
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-pink-500 font-medium transition"
            >
              دسته‌بندی‌ها
            </Link>
            <Link
              href="/brands"
              className="text-gray-700 hover:text-pink-500 font-medium transition"
            >
              برندها
            </Link>
            <Link
              href="/blog"
              className="text-gray-700 hover:text-pink-500 font-medium transition"
            >
              مجله زیبایی
            </Link>
          </nav>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Icon
                  icon="ph:shopping-cart-duotone"
                  width={24}
                  className="text-gray-700"
                />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  3
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 rounded-xl border border-pink-200">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.full_name?.charAt(0) || "ک"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name || user?.phone_number || "کاربر"}
                </span>
              </div>

              <Link
                href="/profile"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Icon
                  icon="ph:user-duotone"
                  width={24}
                  className="text-gray-700"
                />
              </Link>

              <button
                onClick={() => logout()}
                disabled={false}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 disabled:opacity-50"
              >
                <Icon icon="ph:sign-out-duotone" width={24} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all hover:scale-105 font-medium"
              >
                <Icon icon="ph:sign-in-duotone" width={20} />
                <span>ورود / ثبت‌نام</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
