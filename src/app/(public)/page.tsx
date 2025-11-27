// app/page.tsx
"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const {user : userStored} = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  console.log(userStored , 'safffffffffffffffffffff')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50"
    >
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            {isAuthenticated && user?.full_name && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-full animate-bounce">
                <Icon icon="ph:hand-waving-duotone" className="text-2xl" />
                <span className="font-medium text-gray-800">
                  سلام {user.full_name} عزیز! 👋
                </span>
              </div>
            )}

            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
              زیبایی را با
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                گلامور شاپ
              </span>
              <br />
              تجربه کنید 💄✨
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              بهترین برندهای آرایشی و بهداشتی دنیا را با بهترین قیمت و تحویل
              سریع از ما بخواهید. تخفیف‌های ویژه منتظر شماست!
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 font-medium text-lg"
              >
                <Icon icon="ph:shopping-bag-duotone" width={28} />
                <span>خرید کنید</span>
                <Icon
                  icon="ph:arrow-left"
                  width={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="flex items-center gap-3 bg-white border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-2xl hover:bg-pink-50 transition-all font-medium text-lg"
                >
                  <Icon icon="ph:user-plus-duotone" width={28} />
                  <span>عضویت رایگان</span>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  +۱۰۰۰
                </div>
                <div className="text-sm text-gray-600">محصول متنوع</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  +۵۰۰۰
                </div>
                <div className="text-sm text-gray-600">مشتری راضی</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  ۲۴/۷
                </div>
                <div className="text-sm text-gray-600">پشتیبانی</div>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl aspect-square p-8 flex items-center justify-center">
                  <Icon
                    icon="mdi:lipstick"
                    className="text-pink-600"
                    width={120}
                  />
                </div>
                <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl aspect-[4/3] p-8 flex items-center justify-center">
                  <Icon
                    icon="mdi:face-woman-shimmer"
                    className="text-purple-600"
                    width={100}
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl aspect-[4/3] p-8 flex items-center justify-center">
                  <Icon
                    icon="mdi:perfume"
                    className="text-pink-600"
                    width={100}
                  />
                </div>
                <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl aspect-square p-8 flex items-center justify-center">
                  <Icon
                    icon="mdi:sparkles"
                    className="text-purple-600"
                    width={120}
                  />
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-2xl animate-pulse">
              <div className="text-sm font-medium">تخفیف ویژه</div>
              <div className="text-2xl font-bold">تا ۵۰٪</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              چرا گلامور شاپ؟
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ما با ارائه بهترین خدمات، خرید شما را به تجربه‌ای لذت‌بخش تبدیل
              می‌کنیم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "ph:truck-duotone",
                title: "ارسال سریع",
                desc: "ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: "ph:shield-check-duotone",
                title: "ضمانت اصالت",
                desc: "تمامی محصولات اصل و با گارانتی معتبر",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: "ph:headset-duotone",
                title: "پشتیبانی ۲۴/۷",
                desc: "پاسخگویی سریع به سوالات و مشکلات شما",
                color: "from-pink-500 to-purple-500",
              },
              {
                icon: "ph:credit-card-duotone",
                title: "پرداخت امن",
                desc: "درگاه پرداخت معتبر و امن با زیبال",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all hover:scale-105 text-center border border-gray-100"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <Icon icon={feature.icon} className="text-white" width={40} />
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-800">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            دسته‌بندی محصولات
          </h3>
          <p className="text-gray-600">
            از میان صدها محصول متنوع، دسته مورد نظر خود را انتخاب کنید
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              name: "رژ لب",
              icon: "mdi:lipstick",
              color: "from-pink-400 to-pink-600",
            },
            {
              name: "ریمل",
              icon: "mdi:eye",
              color: "from-purple-400 to-purple-600",
            },
            {
              name: "کرم پودر",
              icon: "mdi:face-woman",
              color: "from-pink-400 to-purple-600",
            },
            {
              name: "عطر",
              icon: "mdi:perfume",
              color: "from-purple-400 to-pink-600",
            },
            {
              name: "مراقبت پوست",
              icon: "mdi:face-woman-shimmer",
              color: "from-pink-500 to-purple-500",
            },
            {
              name: "ناخن",
              icon: "mdi:hand-back-right",
              color: "from-purple-500 to-pink-500",
            },
          ].map((cat, i) => (
            <Link
              key={i}
              href={`/products?category=${cat.name}`}
              className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:scale-105 text-center border border-gray-100"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform`}
              >
                <Icon icon={cat.icon} className="text-white" width={32} />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-pink-600 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 py-20">
        <div className="container mx-auto px-6 text-center text-white">
          <Icon
            icon="mdi:gift"
            className="text-white mx-auto mb-6"
            width={64}
          />
          <h3 className="text-4xl font-bold mb-4">
            هدیه ویژه برای اولین خرید!
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            با عضویت در خبرنامه ما، کد تخفیف ۲۰٪ برای اولین خرید خود دریافت کنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              className="flex-1 px-6 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button className="bg-white text-pink-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition whitespace-nowrap">
              عضویت در خبرنامه
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:lipstick" className="text-white" width={24} />
                </div>
                <h4 className="text-xl font-bold">گلامور شاپ</h4>
              </div>
              <p className="text-gray-400 leading-relaxed">
                فروشگاه اینترنتی محصولات آرایشی و بهداشتی با بهترین کیفیت و قیمت
              </p>
            </div>

            {/* Links */}
            <div>
              <h5 className="font-bold mb-4">دسترسی سریع</h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className="text-gray-400 hover:text-white transition"
                  >
                    محصولات
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white transition"
                  >
                    درباره ما
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition"
                  >
                    تماس با ما
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-white transition"
                  >
                    سوالات متداول
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-bold mb-4">پشتیبانی</h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-400 hover:text-white transition"
                  >
                    راهنمای خرید
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-gray-400 hover:text-white transition"
                  >
                    شرایط بازگشت
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white transition"
                  >
                    حریم خصوصی
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white transition"
                  >
                    قوانین و مقررات
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-bold mb-4">تماس با ما</h5>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400">
                  <Icon icon="ph:phone-duotone" width={20} />
                  <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Icon icon="ph:envelope-duotone" width={20} />
                  <span>info@glamorshop.ir</span>
                </li>
                <li className="flex gap-3 mt-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition"
                  >
                    <Icon icon="mdi:instagram" width={20} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition"
                  >
                    <Icon icon="mdi:telegram" width={20} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition"
                  >
                    <Icon icon="mdi:whatsapp" width={20} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© ۱۴۰۳ گلامور شاپ. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
