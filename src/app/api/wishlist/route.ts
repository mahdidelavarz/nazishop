import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/supabase";
import { verifyAccessToken } from "@/shared/lib/jwt/jwt";

// GET /api/wishlist - Get user's wishlist
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

    // Fetch wishlist with product details
    const { data, error } = await supabaseAdmin
      .from("wishlists")
      .select(
        `
        id,
        user_id,
        product_id,
        created_at,
        product:products (
          id,
          title,
          description,
          price,
          original_price,
          thumbnail_url,
          slug,
          brand,
          stock
        )
      `
      )
      .eq("user_id", payload.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Wishlist fetch error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت لیست علاقه‌مندی‌ها" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: data || [],
    });
  } catch (error) {
    console.error("Wishlist API error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// GET /api/wishlist/summary - Get wishlist summary
export async function GET_SUMMARY(request: NextRequest) {
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

    const { data, error } = await supabaseAdmin
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
      count: data || 0,
    });
  } catch (error) {
    console.error("Wishlist summary GET error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from("wishlists")
      .select("id")
      .eq("user_id", payload.userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "محصول قبلاً به لیست علاقه‌مندی‌ها اضافه شده است" },
        { status: 400 }
      );
    }

    // Add to wishlist
    const { data, error } = await supabaseAdmin
      .from("wishlists")
      .insert({
        user_id: payload.userId,
        product_id: productId,
      })
      .select(
        `
        id,
        user_id,
        product_id,
        created_at,
        product:products (
          id,
          title,
          description,
          price,
          original_price,
          thumbnail_url,
          slug,
          brand,
          stock
        )
      `
      )
      .single();

    if (error) {
      console.error("Add to wishlist error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در افزودن به لیست علاقه‌مندی‌ها" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: data,
      message: "محصول به لیست علاقه‌مندی‌ها اضافه شد",
    });
  } catch (error) {
    console.error("Add to wishlist API error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
