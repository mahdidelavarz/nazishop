"use client";

import { supabase } from "@/shared/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Optional: clear any client cache or local state here
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", err.message);
      alert("خطا در خروج. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
    >
      خروج از حساب
    </button>
  );
}
