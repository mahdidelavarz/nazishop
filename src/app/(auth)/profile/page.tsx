// app/(auth)/profile/page.tsx

import ProfileForm from '@/features/auth/components/ProfileForm'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'


export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              تکمیل پروفایل
            </h1>
            <ProfileForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}