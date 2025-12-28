"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Logo } from './Logo';
import { SearchBar } from '../../ui/header/SearchBar';
import { UserMenu } from '../../ui/header/UserMenu';
import { User } from '@/features/auth/types/auth.type';

interface MobileHeaderProps {
  searchOpen: boolean;
  onSearchToggle: () => void;
  user: User | null;
  onLogout: () => void;
}

export function MobileHeader({ searchOpen, onSearchToggle, user, onLogout }: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <Logo mobile />

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:border-primary-400 dark:hover:border-accent-400 transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="منوی کاربر"
                >
                  <Icon
                    icon="ph:user-duotone"
                    width={20}
                    className="text-primary-600 dark:text-accent-400"
                  />
                </button>
                <button
                  onClick={onSearchToggle}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Icon icon="ph:magnifying-glass-duotone" width={22} className="text-foreground" />
                </button>
              </>
            ) : (
              <button
                onClick={onSearchToggle}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Icon icon="ph:magnifying-glass-duotone" width={22} className="text-foreground" />
              </button>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="px-4 pb-3 border-t border-border">
            <div className="mt-3">
              <SearchBar mobile autoFocus placeholder="جستجو..." />
            </div>
          </div>
        )}
      </header>

      {/* Mobile User Menu */}
      {user && (
        <div className="md:hidden">
          <div
            className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
              menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMenuOpen(false)}
          />
            <div
              className={`fixed right-0 top-0 bottom-0 w-80 bg-card shadow-2xl z-50 transform transition-transform duration-300 ${
                menuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">منوی کاربر</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon icon="ph:x-duotone" width={24} className="text-foreground" />
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-73px)]">
                <UserMenu user={user} onLogout={onLogout} mobile onLinkClick={() => setMenuOpen(false)} />
              </div>
            </div>
        </div>
      )}
    </>
  );
}

