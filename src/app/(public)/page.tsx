"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { isAuthenticated, phoneNumber, userId, logout, setAuthenticated, setUserId, setPhoneNumber } = useAuthStore();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Sync auth state from cookies and Supabase on mount
  useEffect(() => {
    const syncAuthState = async () => {
      // Check for auth_state cookie (set by Google OAuth callback)
      const cookies = document.cookie.split(';');
      const authStateCookie = cookies.find(c => c.trim().startsWith('auth_state='));
      
      if (authStateCookie) {
        try {
          const authStateStr = decodeURIComponent(authStateCookie.split('=')[1]);
          const authState = JSON.parse(authStateStr);
          
          if (authState.isAuthenticated) {
            setAuthenticated(true);
            setUserId(authState.userId);
            if (authState.phoneNumber) setPhoneNumber(authState.phoneNumber);
            if (authState.email) setUserEmail(authState.email);
          }
        } catch (e) {
          console.error('Error parsing auth state:', e);
        }
      }

      // Also check Supabase session for Google OAuth users
      const { supabase } = await import('@/shared/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setAuthenticated(true);
        setUserId(session.user.id);
        if (session.user.phone) setPhoneNumber(session.user.phone);
        if (session.user.email) setUserEmail(session.user.email);
      }
    };

    syncAuthState();
  }, [setAuthenticated, setUserId, setPhoneNumber]);

  // Fetch user profile if authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user?.full_name) {
            setUserName(data.user.full_name);
          }
          if (data.success && data.user?.email) {
            setUserEmail(data.user.email);
          }
        })
        .catch(() => {
          // Silently fail - user might not have completed profile
        });
    }
  }, [isAuthenticated, userId]);

  const handleLogout = () => {
    logout();
    toast.success("با موفقیت خارج شدید");
    router.push("/login");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Icon icon="mdi:lipstick" className="text-white" width={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                فروشگاه آرایشی
              </h1>
            </Link>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                  <Icon icon="ph:user-circle-duotone" width={24} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {userName || phoneNumber || "کاربر"}
                  </span>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-pink-500 transition"
                >
                  <Icon icon="ph:user-duotone" width={20} />
                  <span className="hidden sm:inline">پروفایل</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition"
                >
                  <Icon icon="ph:sign-out-duotone" width={20} />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
                >
                  <Icon icon="ph:sign-in-duotone" width={20} />
                  <span>ورود</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Welcome Message */}
          {isAuthenticated && userName && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-full mb-4">
              <Icon icon="ph:hand-waving-duotone" className="text-2xl" />
              <span className="font-medium text-gray-800">
                سلام {userName} عزیز، خوش آمدید! 
              </span>
            </div>
          )}

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            به فروشگاه آرایشی ما
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              خوش آمدید 💄
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اینجا می‌توانید جدیدترین محصولات آرایشی و بهداشتی را مشاهده کنید و
            خریدی راحت و مطمئن داشته باشید.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/products"
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Icon icon="ph:shopping-bag-duotone" width={24} />
              <span className="font-medium">مشاهده محصولات</span>
            </Link>

            {!isAuthenticated && (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-white border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-xl hover:bg-pink-50 transition-all"
              >
                <Icon icon="ph:user-plus-duotone" width={24} />
                <span className="font-medium">عضویت در فروشگاه</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="ph:truck-duotone" className="text-pink-600" width={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">ارسال سریع</h3>
            <p className="text-gray-600 text-sm">
              ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="ph:shield-check-duotone" className="text-purple-600" width={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">ضمانت اصالت</h3>
            <p className="text-gray-600 text-sm">
              تمامی محصولات اصل و با گارانتی معتبر
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="ph:headset-duotone" className="text-blue-600" width={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">پشتیبانی ۲۴/۷</h3>
            <p className="text-gray-600 text-sm">
              پاسخگویی سریع به سوالات و مشکلات شما
            </p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">دسته‌بندی‌های محبوب</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { name: "لوازم آرایشی", icon: "ph:makeup-brush-duotone", color: "from-pink-400 to-pink-600" },
            { name: "مراقبت پوست", icon: "ph:drop-duotone", color: "from-blue-400 to-blue-600" },
            { name: "عطر و ادکلن", icon: "ph:flower-lotus-duotone", color: "from-purple-400 to-purple-600" },
            { name: "مراقبت مو", icon: "ph:hair-dryer-duotone", color: "from-orange-400 to-orange-600" },
          ].map((category) => (
            <Link
              key={category.name}
              href="/products"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:scale-105 text-center"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Icon icon={category.icon} className="text-white" width={32} />
              </div>
              <p className="font-medium text-gray-700">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 فروشگاه آرایشی. تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
}