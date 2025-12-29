"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCartSummary, useCartQuery } from "@/features/cart/hooks/useCart";
import { useWishlistSummary } from "@/features/wishlist/hooks/useWishlist";
import { Logo } from "../ui/header/Logo";
import { SearchBar } from "../ui/header/SearchBar";
import { UserMenu } from "../ui/header/UserMenu";
import { MiniCartPreview } from "../ui/header/MiniCartPreview";
import { NavLinks } from "../ui/header/NavLinks";
import { PromoBar } from "../ui/header/PromoBar";
import { ThemeToggle } from "../ui/header/ThemeToggle";
import { MobileBottomNav } from "../ui/header/MobileBottomNav";
import { MobileHeader } from "@/shared/ui/header/MobileHeader";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { data: cartSummary } = useCartSummary();
  const { data: cartItems = [] } = useCartQuery();
  const { data: wishlistCount = 0 } = useWishlistSummary();

  const cartCount = cartSummary?.totalCount || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Promo Bar */}
      <PromoBar />

      {/* Desktop Header */}
      <header
        className={`hidden md:block sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl backdrop-saturate-150  border-b border-primary-200/40"
            : "bg-background"
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
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-4">
                    {/* wish list button */}
                    <Link
                      href="/wishlist"
                      className="relative group/heart"
                      aria-label="علاقه‌مندی‌ها"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden backdrop-blur-xl bg-white/70 border border-neutral-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-all duration-500 group-hover/heart:scale-105 group-hover/heart:border-primary-300/60 group-hover/heart:shadow-[0_8px_24px_rgba(168,85,247,0.15),inset_0_1px_0_0_rgba(255,255,255,0.95)]">
                        <Icon
                          icon="solar:heart-bold"
                          width={24}
                          className=" z-10 text-neutral-400 group-hover/heart:text-primary-400 transition-all duration-500 group-hover/heart:scale-110"
                        />
                      </div>

                      {/* Enhanced badge - Light Pink */}
                      {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-2 flex items-center justify-center bg-gradient-to-br from-primary-300 via-primary-600 to-primary-300 text-white text-[11px] rounded-full font-bold shadow-[0_2px_10px_rgba(126,34,206,0.4),0_0_0_2px_rgba(255,255,255,0.95)] backdrop-blur-sm">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </Link>

                    {/* Cart - Deep Purple Liquid Glass Button */}
                    <div
                      className="relative"
                      onMouseEnter={() => setShowMiniCart(true)}
                      onMouseLeave={() => setShowMiniCart(false)}
                    >
                      <Link
                        href="/cart"
                        className="relative group/cart block"
                        aria-label="سبد خرید"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden backdrop-blur-xl bg-white/70 border border-neutral-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-all duration-500 group-hover/cart:scale-105 group-hover/cart:border-primary-300/60 group-hover/cart:shadow-[0_8px_24px_rgba(168,85,247,0.15),inset_0_1px_0_0_rgba(255,255,255,0.95)]">
                          <Icon
                            icon="solar:bag-bold-duotone"
                            width={24}
                            className="z-10 text-neutral-700 group-hover/cart:text-primary-600 transition-all duration-500 group-hover/cart:scale-110"
                          />
                        </div>

                        {/* Enhanced badge - Deep Purple */}
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-2 flex items-center justify-center bg-gradient-to-br from-primary-300 via-primary-600 to-primary-300 text-white text-[11px] rounded-full font-bold shadow-[0_2px_10px_rgba(126,34,206,0.4),0_0_0_2px_rgba(255,255,255,0.95)] backdrop-blur-sm">
                            {cartCount > 99 ? "99+" : cartCount}
                          </span>
                        )}
                      </Link>
                      <MiniCartPreview
                        show={showMiniCart}
                        items={cartItems}
                        itemCount={cartCount}
                      />
                    </div>
                  </div>

                  {/* User Menu - Purple/Pink Liquid Glass Pill */}
                  {user && (
                    <div className="relative group">
                      <button
                        className="relative group/user flex items-center gap-3 h-14 pr-4 rounded-xl overflow-hidden"
                        aria-label="منوی کاربر"
                      >
                        {/* Avatar with purple/pink gradient */}
                        <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(168,85,247,0.25)] group-hover/user:shadow-[0_3px_16px_rgba(168,85,247,0.35)] transition-all duration-500 group-hover/user:scale-105">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-accent-200 to-primary-400" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20" />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                          <Icon
                            icon="solar:user-rounded-bold-duotone"
                            width={22}
                            className="relative z-10 text-white"
                          />
                        </div>
                      </button>
                      <UserMenu user={user} onLogout={logout} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <ThemeToggle />
                  {/* Login Button - Purple/Pink Gradient */}
                  <Link
                    href="/login"
                    className="group relative flex items-center gap-2 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 text-white px-6 py-2.5 rounded-xl overflow-hidden font-medium text-sm shadow-[0_4px_16px_rgba(168,85,247,0.25)] hover:shadow-[0_8px_24px_rgba(168,85,247,0.35)] transition-all hover:scale-105"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <Icon
                      icon="ph:sign-in-duotone"
                      width={20}
                      className="relative z-10"
                    />
                    <span className="relative z-10">ورود / ثبت‌نام</span>
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
      <MobileBottomNav
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  );
}
