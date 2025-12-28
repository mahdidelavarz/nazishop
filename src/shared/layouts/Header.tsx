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
            ? "bg-background/80 dark:bg-background/70 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(168,85,247,0.08)] dark:shadow-[0_8px_32px_rgba(168,85,247,0.15)] border-b border-primary-200/40 dark:border-primary-500/20"
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
                  {/* Liquid Glass Action Buttons Container */}
                  <div className="flex items-center gap-4">
                    {/* Wishlist - Light Pink Liquid Glass Button */}
                    <Link
                      href="/wishlist"
                      className="relative group/wishlist"
                      aria-label="علاقه‌مندی‌ها"
                    >
                      {/* Animated outer glow - Soft Pink theme */}
                      {/* <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-300/20 via-primary-200/25 to-primary-300/20 dark:from-accent-400/15 dark:via-accent-300/20 dark:to-accent-400/15 rounded-3xl blur-xl opacity-0 group-hover/wishlist:opacity-100 transition-all duration-700" /> */}

                      {/* Premium glass container - Clean transparent */}
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-[1.25rem] overflow-hidden backdrop-blur-xl bg-white dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-500 group-hover/wishlist:scale-105 group-hover/wishlist:border-accent-200/60 dark:group-hover/wishlist:border-accent-400/40 group-hover/wishlist:shadow-[0_8px_24px_rgba(244,114,182,0.15),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:group-hover/wishlist:shadow-[0_8px_24px_rgba(244,114,182,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                        {/* Multi-layer liquid shine effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-transparent dark:from-white/15 dark:via-white/8 dark:to-transparent" />

                        {/* Animated liquid wave effect - Light Pink gradient */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-accent-100/70 via-accent-50/40 to-transparent dark:from-accent-400/20 dark:via-accent-300/10 dark:to-transparent opacity-0 group-hover/wishlist:opacity-100 transition-all duration-700 group-hover/wishlist:h-full" />

                        {/* Floating shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20 -translate-x-full group-hover/wishlist:translate-x-full transition-transform duration-1000 ease-out" />

                        <Icon
                          icon="solar:heart-bold"
                          width={24}
                          className="relative z-10 text-neutral-200 dark:text-neutral-300 group-hover/wishlist:text-accent-500 dark:group-hover/wishlist:text-accent-400 transition-all duration-500 group-hover/wishlist:scale-110"
                        />
                      </div>

                      {/* Enhanced badge - Light Pink */}
                      {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-2 flex items-center justify-center bg-gradient-to-br from-accent-400 via-accent-500 to-accent-400 text-white text-[11px] rounded-full font-bold shadow-[0_2px_10px_rgba(244,114,182,0.4),0_0_0_2px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_10px_rgba(244,114,182,0.5),0_0_0_2px_rgba(26,15,30,0.9)] backdrop-blur-sm">
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
                        {/* Animated outer glow - Deep Purple theme */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-600/20 via-primary-700/25 to-primary-600/20 rounded-3xl blur-xl opacity-0 group-hover/cart:opacity-100 transition-all duration-700" />

                        {/* Premium glass container - Clean transparent */}
                        <div className="relative flex items-center justify-center w-14 h-14 rounded-[1.25rem] overflow-hidden backdrop-blur-xl bg-white/70 border border-neutral-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-all duration-500 group-hover/cart:scale-105 group-hover/cart:border-primary-300/60 group-hover/cart:shadow-[0_8px_24px_rgba(168,85,247,0.15),inset_0_1px_0_0_rgba(255,255,255,0.95)]">
                          {/* Multi-layer liquid shine effects */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-transparent" />

                          {/* Animated liquid wave effect - Deep Purple gradient */}
                          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary-200/60 via-primary-100/40 to-transparent opacity-0 group-hover/cart:opacity-100 transition-all duration-700 group-hover/cart:h-full" />

                          {/* Floating shimmer */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/cart:translate-x-full transition-transform duration-1000 ease-out" />

                          <Icon
                            icon="solar:bag-bold-duotone"
                            width={24}
                            className="relative z-10 text-neutral-700 group-hover/cart:text-primary-600 transition-all duration-500 group-hover/cart:scale-110"
                          />
                        </div>

                        {/* Enhanced badge - Deep Purple */}
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-2 flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-600 text-white text-[11px] rounded-full font-bold shadow-[0_2px_10px_rgba(126,34,206,0.4),0_0_0_2px_rgba(255,255,255,0.95)] backdrop-blur-sm">
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
                        className="relative group/user flex items-center gap-3 h-14 pl-2 pr-5 rounded-[1.25rem] overflow-hidden"
                        aria-label="منوی کاربر"
                      >
                        {/* Animated outer glow - Purple/Pink blend */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-400/20 via-accent-300/20 to-primary-400/20 dark:from-primary-500/15 dark:via-accent-400/15 dark:to-primary-500/15 rounded-3xl blur-xl opacity-0 group-hover/user:opacity-100 transition-all duration-700" />

                        {/* Premium glass background - Clean transparent */}
                        <div className="absolute inset-0 backdrop-blur-xl bg-white/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 rounded-[1.25rem] shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-500 group-hover/user:border-primary-300/60 dark:group-hover/user:border-primary-500/40 group-hover/user:shadow-[0_8px_24px_rgba(168,85,247,0.12),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:group-hover/user:shadow-[0_8px_24px_rgba(168,85,247,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15)]" />

                        {/* Multi-layer shine overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent dark:from-white/12 dark:via-white/6 dark:to-transparent rounded-[1.25rem]" />

                        {/* Animated liquid wave - Purple/Pink blend */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-100/60 via-accent-50/30 to-transparent dark:from-primary-500/15 dark:via-accent-400/10 dark:to-transparent rounded-b-[1.25rem] opacity-0 group-hover/user:opacity-100 transition-all duration-700 group-hover/user:h-full" />

                        {/* Floating shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20 -translate-x-full group-hover/user:translate-x-full transition-transform duration-1200 ease-out rounded-[1.25rem]" />

                        {/* Avatar with purple/pink gradient */}
                        <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(168,85,247,0.25)] group-hover/user:shadow-[0_3px_16px_rgba(168,85,247,0.35)] transition-all duration-500 group-hover/user:scale-105">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-400 to-primary-700 dark:from-primary-500 dark:via-accent-400 dark:to-primary-600" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20" />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                          <Icon
                            icon="solar:user-rounded-bold-duotone"
                            width={22}
                            className="relative z-10 text-white"
                          />
                        </div>

                        {/* User name with purple hover effect */}
                        <span className="relative z-10 text-[15px] font-semibold text-neutral-700 dark:text-neutral-200 group-hover/user:text-primary-600 dark:group-hover/user:text-primary-400 transition-all duration-500 max-w-[100px] truncate">
                          {user.full_name || "کاربر"}
                        </span>

                        {/* Enhanced dropdown indicator */}
                        <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg backdrop-blur-sm bg-neutral-100/70 dark:bg-neutral-700/50 border border-neutral-200/60 dark:border-neutral-600/40 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] group-hover/user:bg-primary-100/70 dark:group-hover/user:bg-primary-900/40 group-hover/user:border-primary-300/60 dark:group-hover/user:border-primary-600/40 transition-all duration-300">
                          <Icon
                            icon="solar:alt-arrow-down-bold"
                            width={14}
                            className="text-neutral-600 dark:text-neutral-400 group-hover/user:text-primary-600 dark:group-hover/user:text-primary-400 transition-all duration-300 group-hover/user:translate-y-0.5"
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
                    
                    <Icon icon="ph:sign-in-duotone" width={20} className="relative z-10" />
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