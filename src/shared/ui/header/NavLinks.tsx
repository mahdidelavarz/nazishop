"use client";

import { Icon } from '@iconify/react';
import Link from 'next/link';

interface NavLinksProps {
  mobile?: boolean;
}

export function NavLinks({ mobile = false }: NavLinksProps) {
  const navItems = [
    { href: '/categories', label: 'دسته‌بندی', icon: 'ph:squares-four-duotone' },
    { href: '/products', label: 'محصولات', icon: 'ph:package-duotone' },
    { href: '/brands', label: 'برندها', icon: 'ph:star-duotone' },
    { href: '/offers', label: 'پیشنهادات', icon: 'ph:percent-duotone', highlight: true },
    { href: '/blog', label: 'مجله', icon: 'ph:newspaper-duotone' },
  ];

  if (mobile) return null;

  return (
    <nav className="flex items-center justify-center gap-1 py-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all overflow-hidden ${
            item.highlight
              ? 'text-white shadow-[0_2px_12px_rgba(168,85,247,0.25)] hover:shadow-[0_3px_16px_rgba(168,85,247,0.35)]'
              : 'text-foreground hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:text-primary-600 dark:hover:from-primary-950 dark:hover:to-accent-950'
          }`}
        >
          {item.highlight && (
            <>
              {/* Base gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-accent-200 to-primary-400" />
              
              {/* Depth layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
            </>
          )}
          <Icon icon={item.icon} width={18} className="relative z-10" />
          <span className="relative z-10">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

