import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/serverAuth";

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

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
          brand:brands(name),
          stock
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Wishlist fetch error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت لیست علاقه‌مندی‌ها" },
        { status: 500 }
      );
    }

    // Transform brand from object to string
    const items = (data || []).map((item) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        brand: item.product.brand?.name ?? null,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Wishlist API error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

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
      .eq("user_id", user.id)
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
        user_id: user.id,
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
          brand:brands(name),
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

    // Transform brand from object to string
    const item = data ? {
      ...data,
      product: data.product ? {
        ...data.product,
        brand: data.product.brand?.name ?? null,
      } : null,
    } : null;

    return NextResponse.json({
      success: true,
      item,
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
