import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/serverAuth";

interface RouteParams {
  params: Promise<{
    productId: string;
  }>;
}

// DELETE /api/wishlist/[productId] - Remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { productId } = await params;
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    // Delete from wishlist
    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
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
