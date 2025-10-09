"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle auth tokens from query parameters
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    if (error) {
      setError(`خطا: ${error}`);
      return;
    }

    if (access_token && refresh_token) {
      // Set session to authenticate the user
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(({ error }) => {
          if (error) {
            setError("خطا در تأیید لینک: " + error.message);
          }
        });
    } else {
      setError("لینک بازنشانی نامعتبر است.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("رمزهای عبور وارد شده مطابقت ندارند.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("رمز عبور با موفقیت تغییر یافت. لطفاً وارد شوید.");
      setTimeout(() => router.push("/login"), 2000); // Redirect to login after 2 seconds
    } catch (err: any) {
      setError("خطا در تغییر رمز عبور: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">تغییر رمز عبور</h1>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium">
            رمز عبور جدید
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
            required
            placeholder="رمز عبور جدید را وارد کنید"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            تأیید رمز عبور
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
            required
            placeholder="رمز عبور را دوباره وارد کنید"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "در حال تغییر..." : "تغییر رمز عبور"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link
          href="/login"
          className="text-blue-500 underline hover:text-blue-700"
        >
          بازگشت به ورود
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
