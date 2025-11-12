// src/features/auth/components/UserMenu.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useAuth } from '../hooks/useAuth'

/**
 * User Menu Component
 * Shows user info and logout button
 */
export default function UserMenu() {
  const router = useRouter()
  const { user, logout, isLoggingOut, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  const displayName = user.fullName || user.phoneNumber || user.email || 'کاربر'

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {displayName}
        </span>
        <Icon
          icon="ph:caret-down"
          className={`text-gray-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          width={16}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            {user.phoneNumber && (
              <p className="text-xs text-gray-500 mt-1" dir="ltr">
                {user.phoneNumber}
              </p>
            )}
            {user.email && (
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            )}
            {isAdmin && (
              <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                مدیر
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/profile')
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Icon icon="ph:user-duotone" width={20} />
              پروفایل من
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/orders')
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Icon icon="ph:shopping-bag-duotone" width={20} />
              سفارش‌های من
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/admin')
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Icon icon="ph:gear-duotone" width={20} />
                پنل مدیریت
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
                  در حال خروج...
                </>
              ) : (
                <>
                  <Icon icon="ph:sign-out-duotone" width={20} />
                  خروج از حساب
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}