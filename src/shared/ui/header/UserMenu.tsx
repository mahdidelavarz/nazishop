"use client";

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { User } from '@/features/auth/types/auth.type';
import { useThemeStore } from '@/shared/store/themeStore';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  mobile?: boolean;
  onLinkClick?: () => void;
}

export function UserMenu({ user, onLogout, mobile = false, onLinkClick }: UserMenuProps) {
  const { theme, toggleTheme } = useThemeStore();

  const menuItems = [
    { icon: 'ph:user-duotone', label: 'پروفایل من', href: '/profile' },
    { icon: 'ph:shopping-bag-duotone', label: 'سفارشات', href: '/orders' },
    { icon: 'ph:heart-duotone', label: 'علاقه‌مندی‌ها', href: '/wishlist' },
    { icon: 'ph:map-pin-duotone', label: 'آدرس‌ها', href: '/addresses' },
    { icon: 'ph:gear-duotone', label: 'تنظیمات', href: '/settings' },
  ];

  const userInitial = user?.full_name?.charAt(0) || user?.phone_number?.charAt(0) || 'ک';

  // Mobile menu renders differently
  if (mobile) {
    return (
      <div className="p-4">
        {/* User Info */}
        <div className="p-4 border border-border bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 rounded-2xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">{userInitial}</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {user?.full_name || user?.phone_number || 'کاربر'}
              </p>
              {user?.phone_number && (
                <p className="text-xs text-muted-foreground mt-0.5">{user.phone_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-xl transition-colors text-sm"
            >
              <Icon
                icon={item.icon}
                width={20}
                className="text-neutral-600 dark:text-neutral-400"
              />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted rounded-xl transition-colors text-sm"
          >
            <div className="flex items-center gap-3">
              <Icon
                icon={theme === 'light' ? 'ph:moon-duotone' : 'ph:sun-duotone'}
                width={20}
                className="text-neutral-600 dark:text-neutral-400"
              />
              <span>تغییر تم</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {theme === 'light' ? 'روشن' : 'تاریک'}
            </span>
          </button>

          <div className="h-px bg-border my-2"></div>

          <button
            onClick={() => {
              onLogout();
              onLinkClick?.();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-error/10 rounded-xl transition-colors text-sm text-error"
          >
            <Icon icon="ph:sign-out-duotone" width={20} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Dropdown Menu */}
      <div className="absolute left-0 top-full mt-2 w-64 bg-card rounded-2xl shadow-2xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {/* User Info */}
        <div className="p-4 border-b border-border bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">{userInitial}</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {user?.full_name || user?.phone_number || 'کاربر'}
              </p>
              {user?.phone_number && (
                <p className="text-xs text-muted-foreground mt-0.5">{user.phone_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-xl transition-colors text-sm group/item"
            >
              <Icon
                icon={item.icon}
                width={20}
                className="text-neutral-600 dark:text-neutral-400 group-hover/item:text-primary-600"
              />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted rounded-xl transition-colors text-sm group/item"
          >
            <div className="flex items-center gap-3">
              <Icon
                icon={theme === 'light' ? 'ph:moon-duotone' : 'ph:sun-duotone'}
                width={20}
                className="text-neutral-600 dark:text-neutral-400 group-hover/item:text-primary-600"
              />
              <span>تغییر تم</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {theme === 'light' ? 'روشن' : 'تاریک'}
            </span>
          </button>

          <div className="h-px bg-border my-2"></div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-error/10 rounded-xl transition-colors text-sm text-error"
          >
            <Icon icon="ph:sign-out-duotone" width={20} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </div>
    </div>
  );
}

