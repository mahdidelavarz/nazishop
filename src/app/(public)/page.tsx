"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useProductsQuery } from "@/features/products/hooks/useProducts";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: allProducts = [], isLoading: productsLoading } =
    useProductsQuery();

  // Filter products with discounts and take first 5
  const discountProducts = useMemo(() => {
    return allProducts
      .filter(
        (product) => product.discount_percent && product.discount_percent > 0
      )
      .slice(0, 5);
  }, [allProducts]);

  const heroSlides = [
    {
      title: "کلکسیون بهار",
      subtitle: "جدیدترین رنگ‌های رژلب",
      discount: "40%",
      image: "/images/pexels-noratopicals-7038233.jpg",
      // gradient: "from-pink-500/90 to-rose-500/90",
    },
    {
      title: "عطرهای لوکس",
      subtitle: "برندهای معتبر جهانی",
      discount: "30%",
      image: "/images/441824c52072304ee1e81efcbde20169.jpg",
      // gradient: "from-purple-500/90 to-pink-500/90",
    },
    {
      title: "مراقبت پوست",
      subtitle: "محصولات ارگانیک و طبیعی",
      discount: "50%",
      image: "/images/b213e892f2322d5b2132e138e65b490c.jpg",
      // gradient: "from-emerald-500/90 to-teal-500/90",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Full Screen Hero Slider */}
      <section className="relative h-[70vh] md:h-[75vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
              {/* <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              /> */}
            <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-fill" />

            {/* Overlay Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-l`}
            />

            {/* Content */}
            <div className="relative h-full container mx-auto px-6 flex items-center justify-end">
              <div className="max-w-2xl text-white text-right">
                {isAuthenticated && user?.full_name && index === 0 && (
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-6 animate-fade-in">
                    <Icon icon="ph:hand-waving-duotone" className="text-2xl" />
                    <span className="font-medium">
                      سلام {user.full_name} عزیز! 👋
                    </span>
                  </div>
                )}

                <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in-up">
                  {slide.title}
                </h1>
                <p className="text-2xl md:text-3xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
                  {slide.subtitle}
                </p>

                <div className="flex items-center gap-6 mb-8 animate-fade-in-up animation-delay-400">
                  <div className="bg-white text-pink-600 px-8 py-4 rounded-2xl font-bold text-3xl shadow-2xl">
                    تخفیف {slide.discount}
                  </div>
                  <div className="text-xl opacity-90">فقط برای امروز!</div>
                </div>

                <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-600">
                  <Link
                    href="/products"
                    className="group flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 font-bold text-lg"
                  >
                    <span>خرید کنید</span>
                    <Icon
                      icon="ph:arrow-left"
                      width={24}
                      className="group-hover:-translate-x-2 transition-transform"
                    />
                  </Link>

                  <Link
                    href="/categories"
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border-2 border-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all font-bold text-lg"
                  >
                    <span>دسته‌بندی‌ها</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index
                  ? "w-12 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
            )
          }
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all z-10"
        >
          <Icon icon="ph:caret-right-bold" width={24} />
        </button>
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
          }
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all z-10"
        >
          <Icon icon="ph:caret-left-bold" width={24} />
        </button>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              دسته‌بندی محصولات
            </h2>
            <p className="text-gray-600 text-lg">
              از میان صدها محصول متنوع، دسته مورد نظر خود را انتخاب کنید
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 animate-pulse p-6 rounded-3xl h-32"
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={
                    cat.slug
                      ? `/products?category=${cat.slug}`
                      : `/products?category=${cat.name}`
                  }
                  className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-3xl shadow-sm hover:shadow-2xl transition-all hover:scale-105 text-center border border-gray-100"
                >
                  {cat.image ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 group-hover:rotate-12 transition-transform shadow-lg">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : cat.icon && cat.color ? (
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform shadow-lg`}
                    >
                      <Icon icon={cat.icon} className="text-white" width={32} />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform shadow-lg">
                      <Icon
                        icon="mdi:package-variant"
                        className="text-white"
                        width={32}
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500">
                    {cat.count > 0 ? `${cat.count}+` : "0"} محصول
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              دسته‌بندی‌ای یافت نشد
            </div>
          )}
        </div>
      </section>

      {/* Discount Products Slider */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                پیشنهادهای ویژه
              </h2>
              <p className="text-gray-600">محصولات با تخفیف‌های باور نکردنی</p>
            </div>
            <Link
              href="/products?discount=true"
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold group"
            >
              <span>مشاهده همه</span>
              <Icon
                icon="ph:arrow-left"
                width={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : discountProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon
                icon="ph:package-duotone"
                className="text-gray-400 mx-auto mb-4"
                width={64}
              />
              <p>در حال حاضر محصولی با تخفیف موجود نیست</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {discountProducts.map((product) => {
                const finalPrice = product.discount_percent
                  ? product.price * (1 - product.discount_percent / 100)
                  : product.price;
                const originalPrice = product.original_price || product.price;
                const thumbnailUrl =
                  product.thumbnail_url &&
                  product.thumbnail_url.trim().length > 0
                    ? product.thumbnail_url.startsWith("http")
                      ? product.thumbnail_url
                      : product.thumbnail_url.startsWith("/")
                      ? product.thumbnail_url
                      : `/${product.thumbnail_url}`
                    : null;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all hover:scale-105"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {thumbnailUrl ? (
                        <Image
                          src={thumbnailUrl}
                          alt={product.title}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Icon
                            icon="ph:image-duotone"
                            className="text-gray-400"
                            width={48}
                          />
                        </div>
                      )}
                      {product.discount_percent && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {Math.round(product.discount_percent)}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {product.brand && (
                        <p className="text-xs text-gray-500 mb-1">
                          {product.brand}
                        </p>
                      )}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <Icon
                            icon="ph:star-fill"
                            className="text-yellow-400"
                            width={16}
                          />
                          <span className="text-sm text-gray-600">
                            {product.rating.toFixed(1)}
                          </span>
                          {product.reviews_count > 0 && (
                            <span className="text-xs text-gray-400">
                              ({product.reviews_count})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-pink-600">
                          {finalPrice.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                      {product.discount_percent &&
                        originalPrice > finalPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            {originalPrice.toLocaleString("fa-IR")} تومان
                          </div>
                        )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                desc: "درگاه پرداخت معتبر و امن",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, i) => (
              <div key={i} className="group text-center">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl`}
                >
                  <Icon icon={feature.icon} className="text-white" width={40} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              برندهای معتبر
            </h2>
            <p className="text-gray-600">همکاری با بهترین برندهای جهانی</p>
          </div>

          {brandsLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 animate-pulse p-6 rounded-2xl aspect-video"
                />
              ))}
            </div>
          ) : brands.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={
                    brand.slug
                      ? `/brands/${brand.slug}`
                      : `/brands/${brand.name}`
                  }
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center aspect-video"
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain opacity-60 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-gray-400 font-medium">
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              برندی یافت نشد
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500">
        <div className="container mx-auto px-6 text-center text-white">
          <Icon
            icon="mdi:gift"
            className="text-white mx-auto mb-6"
            width={64}
          />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            هدیه ویژه برای اولین خرید!
          </h2>
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
