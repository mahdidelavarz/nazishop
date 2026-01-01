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
      .eq("user_id", user.id);

    if (error) {
      console.error("Wishlist fetch error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت لیست علاقه‌مندی‌ها" },
        { status: 500 }
      );
    }

    // Transform brand from object to string
    const items = (data || []).map((item) => {
      const product = item.product as {
        id: string;
        title: string;
        description: string | null;
        price: number;
        original_price: number | null;
        thumbnail_url: string | null;
        slug: string;
        brand: { name: string } | null;
        stock: number;
      } | null;
      
      return {
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        product: product ? {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          thumbnail_url: product.thumbnail_url,
          slug: product.slug,
          brand: product.brand?.name ?? null,
          stock: product.stock,
        } : null,
      };
    });

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
    const product = data?.product as {
      id: string;
      title: string;
      description: string | null;
      price: number;
      original_price: number | null;
      thumbnail_url: string | null;
      slug: string;
      brand: { name: string } | null;
      stock: number;
    } | null;
    
    const item = data ? {
      id: data.id,
      user_id: data.user_id,
      product_id: data.product_id,
      product: product ? {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        thumbnail_url: product.thumbnail_url,
        slug: product.slug,
        brand: product.brand?.name ?? null,
        stock: product.stock,
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
