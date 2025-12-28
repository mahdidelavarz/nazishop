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
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            item.highlight
              ? 'bg-gradient-to-r from-accent-500 to-primary-500 text-white hover:shadow-md hover:shadow-accent-200'
              : 'text-foreground hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:text-primary-600 dark:hover:from-primary-950 dark:hover:to-accent-950'
          }`}
        >
          <Icon icon={item.icon} width={18} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

