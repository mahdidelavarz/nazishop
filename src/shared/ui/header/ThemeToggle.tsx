"use client";

import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useThemeStore } from '@/shared/store/themeStore';

interface ThemeToggleProps {
  onClick?: () => void;
  className?: string;
}

export function ThemeToggle({ onClick, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme to document on mount and when theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleTheme();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center w-11 h-11 rounded-xl bg-card border border-border hover:border-primary-400 dark:hover:border-accent-400 transition-all duration-300 shadow-sm hover:shadow-md group ${className || ''}`}
      aria-label="تغییر تم"
    >
      {theme === 'light' ? (
        <Icon
          icon="ph:moon-duotone"
          width={20}
          className="text-primary-600 transition-transform group-hover:scale-110"
        />
      ) : (
        <Icon
          icon="ph:sun-duotone"
          width={20}
          className="text-accent-400 transition-transform group-hover:scale-110 group-hover:rotate-12"
        />
      )}
    </button>
  );
}

