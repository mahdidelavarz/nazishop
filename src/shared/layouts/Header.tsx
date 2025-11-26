// components/layout/Header.tsx

'use client';


import { useAuth } from '@/features/auth/hooks/useAuth';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-blue-600">
              لوگو
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                خانه
              </Link>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  پروفایل
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <Icon icon="mdi:account-circle" width={24} />
                  <span className="font-medium">
                    {user.full_name || user.phone_number}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Icon icon="mdi:logout" width={20} />
                  خروج
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon icon="mdi:login" width={20} />
                ورود
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}