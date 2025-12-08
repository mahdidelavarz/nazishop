import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/supabase";
import { verifyAccessToken } from "@/shared/lib/jwt/jwt";

// GET /api/wishlist/summary - Get wishlist summary (count only)
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "لطفا وارد شوید" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: "توکن نامعتبر است" },
        { status: 401 }
      );
    }

    const { count, error } = await supabaseAdmin
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", payload.userId);

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
