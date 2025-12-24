"use client";

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { User } from '@/features/auth/types/auth.type';

interface MobileBottomNavProps {
  user: User | null;
  cartCount: number;
  wishlistCount: number;
}

export function MobileBottomNav({ user, cartCount, wishlistCount }: MobileBottomNavProps) {
  const userInitial = user?.full_name?.charAt(0) || user?.phone_number?.charAt(0) || 'ک';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl">
      <div className="grid grid-cols-5 gap-1 px-2 py-2 safe-area-bottom">
        <Link
          href="/"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-muted transition-colors"
        >
          <Icon icon="ph:house-duotone" width={24} className="text-primary-600" />
          <span className="text-[10px] font-medium text-foreground mt-1">خانه</span>
        </Link>

        <Link
          href="/categories"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-muted transition-colors"
        >
          <Icon icon="ph:squares-four-duotone" width={24} className="text-neutral-600 dark:text-neutral-400" />
          <span className="text-[10px] font-medium text-muted-foreground mt-1">دسته‌ها</span>
        </Link>

        <Link href="/cart" className="relative flex flex-col items-center justify-center -mt-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-300 flex items-center justify-center hover:scale-105 transition-transform">
            <Icon icon="ph:shopping-cart-duotone" width={26} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-foreground mt-2">سبد خرید</span>
        </Link>

        <Link
          href="/wishlist"
          className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-muted transition-colors"
        >
          <Icon icon="ph:heart-duotone" width={24} className="text-neutral-600 dark:text-neutral-400" />
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-3 bg-accent-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">
              {wishlistCount > 9 ? '9+' : wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-medium text-muted-foreground mt-1">علاقه‌مندی</span>
        </Link>

        <Link
          href={user ? '/profile' : '/login'}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-muted transition-colors"
        >
          {user ? (
            <>
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{userInitial}</span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground mt-1">پروفایل</span>
            </>
          ) : (
            <>
              <Icon icon="ph:user-duotone" width={24} className="text-neutral-600 dark:text-neutral-400" />
              <span className="text-[10px] font-medium text-muted-foreground mt-1">ورود</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  );
}

