import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/serverAuth";

// GET /api/wishlist/summary - Get wishlist summary (count only)
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { count, error } = await supabaseAdmin
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Wishlist summary error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت تعداد علاقه‌مندی‌ها" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: count ?? 0,
    });
  } catch (error) {
    console.error("Wishlist summary GET error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
