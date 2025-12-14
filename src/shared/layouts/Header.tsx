import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

// Mock hooks for demonstration
const useAuth = () => ({
  user: { full_name: 'سارا احمدی', phone_number: '09123456789' },
  isAuthenticated: true,
  logout: () => console.log('Logout')
});

const useCartSummary = () => ({ data: { totalCount: 3 } });
const useWishlistSummary = () => ({ data: 5 });

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: cartSummary } = useCartSummary();
  const totalItems = cartSummary?.totalCount ?? 0;
  const { data: wishlistSummary } = useWishlistSummary();
  const wishlistCount = wishlistSummary ?? 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/products', label: 'محصولات', icon: 'ph:package-duotone' },
    { href: '/categories', label: 'دسته‌بندی', icon: 'ph:squares-four-duotone' },
    { href: '/brands', label: 'برندها', icon: 'ph:star-duotone' },
    { href: '/blog', label: 'مجله', icon: 'ph:newspaper-duotone' }
  ];

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-md'
            : 'bg-white'
        }`}
      >
        <div className="container mx-auto px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-pink-300 transition-all group-hover:scale-105">
                  <Icon icon="mdi:lipstick" className="text-white" width={24} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 rounded-full blur-sm"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  گلامور شاپ
                </h1>
                <p className="text-[10px] text-gray-500">زیبایی در هر لحظه</p>
              </div>
            </a>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی محصولات، برندها..."
                  className="w-full px-5 py-3 pr-12 rounded-2xl bg-gray-50 border border-gray-200 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none text-sm"
                />
                <Icon
                  icon="ph:magnifying-glass-duotone"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  width={20}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <Icon icon="ph:moon-duotone" width={22} className="text-gray-600" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Wishlist */}
                  <a
                    href="/wishlist"
                    className="relative p-2.5 hover:bg-pink-50 rounded-xl transition-colors group"
                  >
                    <Icon
                      icon="ph:heart-duotone"
                      width={22}
                      className="text-gray-600 group-hover:text-pink-600 transition-colors"
                    />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-500 to-pink-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium shadow-lg">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </a>

                  {/* Cart */}
                  <a
                    href="/cart"
                    className="relative p-2.5 hover:bg-purple-50 rounded-xl transition-colors group"
                  >
                    <Icon
                      icon="ph:shopping-cart-duotone"
                      width={22}
                      className="text-gray-600 group-hover:text-purple-600 transition-colors"
                    />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium shadow-lg">
                        {totalItems}
                      </span>
                    )}
                  </a>

                  {/* User Menu */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-bold">
                          {user?.full_name?.charAt(0) || 'ک'}
                        </span>
                      </div>
                      <Icon icon="ph:caret-down" width={16} className="text-gray-600" />
                    </button>

                    {/* Dropdown */}
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 text-sm">
                          {user?.full_name || 'کاربر'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user?.phone_number}
                        </p>
                      </div>
                      <div className="p-2">
                        <a href="/profile" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm">
                          <Icon icon="ph:user-duotone" width={20} className="text-gray-600" />
                          <span>پروفایل من</span>
                        </a>
                        <a href="/orders" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm">
                          <Icon icon="ph:package-duotone" width={20} className="text-gray-600" />
                          <span>سفارشات</span>
                        </a>
                        <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm">
                          <Icon icon="ph:gear-duotone" width={20} className="text-gray-600" />
                          <span>تنظیمات</span>
                        </a>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-sm text-red-600 mt-1"
                        >
                          <Icon icon="ph:sign-out-duotone" width={20} />
                          <span>خروج</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <a
                  href="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all hover:scale-105 font-medium text-sm"
                >
                  <Icon icon="ph:sign-in-duotone" width={20} />
                  <span>ورود / ثبت‌نام</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-center gap-1 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-pink-600 transition-all"
              >
                <Icon icon={link.icon} width={18} />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile: Top Bar (minimal) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Icon icon="mdi:lipstick" className="text-white" width={20} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              گلامور شاپ
            </span>
          </a>

          {/* Search Icon */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon icon="ph:magnifying-glass-duotone" width={22} className="text-gray-700" />
          </button>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="px-4 pb-3 border-t border-gray-100">
            <div className="relative mt-3">
              <input
                type="text"
                placeholder="جستجو..."
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-300 focus:bg-white transition-all outline-none text-sm"
                autoFocus
              />
              <Icon
                icon="ph:magnifying-glass-duotone"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                width={18}
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile: Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {/* Home */}
          <a
            href="/"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Icon icon="ph:house-duotone" width={24} className="text-pink-600" />
            <span className="text-[10px] font-medium text-gray-700 mt-1">خانه</span>
          </a>

          {/* Categories */}
          <a
            href="/categories"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Icon icon="ph:squares-four-duotone" width={24} className="text-gray-600" />
            <span className="text-[10px] font-medium text-gray-600 mt-1">دسته‌ها</span>
          </a>

          {/* Cart */}
          <a
            href="/cart"
            className="relative flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-2xl shadow-2xl shadow-pink-300 flex items-center justify-center hover:scale-105 transition-transform">
              <Icon icon="ph:shopping-cart-duotone" width={26} className="text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-gray-700 mt-2">سبد خرید</span>
          </a>

          {/* Wishlist */}
          <a
            href="/wishlist"
            className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Icon icon="ph:heart-duotone" width={24} className="text-gray-600" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-3 bg-pink-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
            <span className="text-[10px] font-medium text-gray-600 mt-1">علاقه‌مندی</span>
          </a>

          {/* Profile */}
          <a
            href={'/profile'}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {isAuthenticated ? (
              <>
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">
                    {user?.full_name?.charAt(0) || 'ک'}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-600 mt-1">پروفایل</span>
              </>
            ) : (
              <>
                <Icon icon="ph:user-duotone" width={24} className="text-gray-600" />
                <span className="text-[10px] font-medium text-gray-600 mt-1">ورود</span>
              </>
            )}
          </a>
        </div>
      </nav>

      {/* Spacers */}
      <div className="h-[100px] md:h-[120px]"></div>
      <div className="h-20 md:hidden"></div>
    </>
  );
}