import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/supabase";
import { verifyAccessToken } from "@/shared/lib/jwt/jwt";

// DELETE /api/wishlist/[productId] - Remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
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

    // Delete from wishlist
    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("user_id", payload.userId)
      .eq("product_id", productId);

    if (error) {
      console.error("Remove from wishlist error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در حذف از لیست علاقه‌مندی‌ها" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "محصول از لیست علاقه‌مندی‌ها حذف شد",
    });
  } catch (error) {
    console.error("Remove from wishlist API error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
