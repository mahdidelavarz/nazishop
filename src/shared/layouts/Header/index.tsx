"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCartSummary, useCartQuery } from '@/features/cart/hooks/useCart';
import { useWishlistSummary } from '@/features/wishlist/hooks/useWishlist';
import { useThemeStore } from '@/shared/store/themeStore';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { MiniCartPreview } from './MiniCartPreview';
import { NavLinks } from './NavLinks';
import { PromoBar } from './PromoBar';
import { ThemeToggle } from './ThemeToggle';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { data: cartSummary } = useCartSummary();
  const { data: cartItems = [] } = useCartQuery();
  const { data: wishlistCount = 0 } = useWishlistSummary();
  const { theme } = useThemeStore();

  const cartCount = cartSummary?.totalCount || 0;

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Promo Bar */}
      <PromoBar />

      {/* Desktop Header */}
      <header
        className={`hidden md:block sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg border-b border-border'
            : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            <Logo />

            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/wishlist"
                    className="relative p-2.5 hover:bg-accent-50 dark:hover:bg-accent-950 rounded-xl transition-colors group"
                    aria-label="علاقه‌مندی‌ها"
                  >
                    <Icon
                      icon="ph:heart-duotone"
                      width={22}
                      className="text-neutral-600 dark:text-neutral-400 group-hover:text-accent-600 transition-colors"
                    />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold shadow-md">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </Link>

                  <div
                    className="relative"
                    onMouseEnter={() => setShowMiniCart(true)}
                    onMouseLeave={() => setShowMiniCart(false)}
                  >
                    <Link
                      href="/cart"
                      className="relative p-2.5 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-xl transition-colors group"
                      aria-label="سبد خرید"
                    >
                      <Icon
                        icon="ph:shopping-cart-duotone"
                        width={22}
                        className="text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 transition-colors"
                      />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold shadow-md">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </Link>
                    <MiniCartPreview
                      show={showMiniCart}
                      items={cartItems}
                      itemCount={cartCount}
                    />
                  </div>

                  {/* User Menu with Theme Toggle Inside */}
                  {user && (
                    <div className="relative group">
                      {/* User Menu Trigger Button */}
                      <button
                        className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-card border border-border hover:border-primary-400 dark:hover:border-accent-400 transition-all duration-300 shadow-sm hover:shadow-md group/btn"
                        aria-label="منوی کاربر"
                      >
                        <Icon
                          icon="ph:user-duotone"
                          width={20}
                          className="text-primary-600 dark:text-accent-400 transition-transform group-hover/btn:scale-110"
                        />
                      </button>
                      <UserMenu user={user} onLogout={logout} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link
                    href="/login"
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all hover:scale-105 font-medium text-sm"
                  >
                    <Icon icon="ph:sign-in-duotone" width={20} />
                    <span>ورود / ثبت‌نام</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <NavLinks />
        </div>
      </header>

      {/* Mobile Header */}
      <MobileHeader 
        searchOpen={searchOpen} 
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        user={user || null}
        onLogout={logout}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav user={user} cartCount={cartCount} wishlistCount={wishlistCount} />

      {/* Spacers */}
      <div className="h-[140px] md:h-[160px]"></div>
      <div className="h-20 md:hidden"></div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}

