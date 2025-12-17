import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/serverAuth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: rawId } = await params;
    const id = (rawId || "").trim();
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const isAdmin = user.role === "admin";

    // Fetch order including shipping fields and joined user
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        user_id,
        total,
        status,
        shipping_cost,
        shipping_method,
        created_at,
        users:users (
          id,
          email,
          full_name,
          phone_number,
          address,
          postal_code,
          birthday,
          profile_completed,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: "سفارش یافت نشد" },
        { status: 404 }
      );
    }

    // Access control
    if (!isAdmin && order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        id,
        product_id,
        quantity,
        price_at_purchase,
        products:products(id, title, thumbnail_url)
      `
      )
      .eq("order_id", id);

    if (itemsError) {
      console.error("Order items fetch error:", itemsError);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت اقلام سفارش" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: items || []
      }
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
