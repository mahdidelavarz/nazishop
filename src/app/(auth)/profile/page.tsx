// app/profile/page.tsx

"use client";

import { useState } from "react";
import CompleteProfileForm from "@/features/auth/components/CompleteProfileForm";
import EditProfileForm from "@/features/auth/components/EditProfileForm";
import { useProtectedRoute } from "@/features/auth/hooks/useProtectedRoute";
import { Icon } from "@iconify/react";

export default function ProfilePage() {
  const { user, isLoading } = useProtectedRoute();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="animate-spin text-blue-600 mx-auto mb-4"
            width={48}
          />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show complete profile form if profile is incomplete
  if (!user?.profile_completed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="mdi:account-edit"
                    className="text-blue-600"
                    width={32}
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  تکمیل اطلاعات
                </h1>
                <p className="text-gray-600">لطفا اطلاعات خود را تکمیل کنید</p>
              </div>

              <CompleteProfileForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile details if profile is complete
  if (isEditing && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="mdi:account-edit"
                    className="text-blue-600"
                    width={32}
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  ویرایش پروفایل
                </h1>
                <p className="text-gray-600">اطلاعات خود را ویرایش کنید</p>
              </div>

              <EditProfileForm
                user={user}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <Icon
                      icon="mdi:account-circle"
                      className="text-blue-600"
                      width={48}
                    />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">{user.full_name}</h1>
                    <p className="text-blue-100">{user.phone_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Icon icon="mdi:pencil" width={20} />
                  ویرایش
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                اطلاعات حساب کاربری
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="mdi:account"
                      className="text-gray-600 mt-1"
                      width={24}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">نام کامل</p>
                      <p className="font-medium text-gray-800">
                        {user.full_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="mdi:phone"
                      className="text-gray-600 mt-1"
                      width={24}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">شماره موبایل</p>
                      <p className="font-medium text-gray-800">
                        {user.phone_number}
                      </p>
                    </div>
                  </div>
                </div>

                {user.email && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="mdi:email"
                        className="text-gray-600 mt-1"
                        width={24}
                      />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ایمیل</p>
                        <p className="font-medium text-gray-800">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="mdi:map-marker"
                      className="text-gray-600 mt-1"
                      width={24}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">آدرس</p>
                      <p className="font-medium text-gray-800">
                        {user.address}
                      </p>
                    </div>
                  </div>
                </div>

                {user.postal_code && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="mdi:mailbox"
                        className="text-gray-600 mt-1"
                        width={24}
                      />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">کد پستی</p>
                        <p className="font-medium text-gray-800">
                          {user.postal_code}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {user.birthday && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="mdi:cake"
                        className="text-gray-600 mt-1"
                        width={24}
                      />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">تاریخ تولد</p>
                        <p className="font-medium text-gray-800">
                          {new Date(user.birthday).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="mdi:shield-account"
                      className="text-gray-600 mt-1"
                      width={24}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">نقش کاربری</p>
                      <p className="font-medium text-gray-800">
                        {user.role === "admin" ? "مدیر" : "کاربر"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="mdi:calendar"
                      className="text-gray-600 mt-1"
                      width={24}
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">تاریخ عضویت</p>
                      <p className="font-medium text-gray-800">
                        {new Date(user.created_at).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
