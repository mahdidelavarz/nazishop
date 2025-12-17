import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/serverAuth";

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    // Fetch cart items with product pricing
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity,
        products:products(id, price, discount_percent)
      `
      )
      .eq("user_id", user.id);

    if (cartError) {
      console.error("Order creation cart fetch error:", cartError);
      return NextResponse.json(
        { success: false, message: "خطا در خواندن سبد خرید" },
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "سبد خرید خالی است" },
        { status: 400 }
      );
    }

    const total = cartItems.reduce((sum, item) => {
      const basePrice = item.products?.price ?? 0;
      const discount = item.products?.discount_percent ?? 0;
      const finalPrice =
        discount && discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
      return sum + finalPrice * item.quantity;
    }, 0);

    // Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "pending",
      })
      .select("id, total, status, created_at")
      .single();

    if (orderError || !order) {
      console.error("Order creation insert error:", orderError);
      return NextResponse.json(
        { success: false, message: "خطا در ثبت سفارش" },
        { status: 500 }
      );
    }

    // Insert order items
    const orderItemsPayload = cartItems.map((item) => {
      const basePrice = item.products?.price ?? 0;
      const discount = item.products?.discount_percent ?? 0;
      const finalPrice =
        discount && discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: finalPrice,
      };
    });

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { success: false, message: "خطا در ثبت اقلام سفارش" },
        { status: 500 }
      );
    }

    // Clear cart
    await supabaseAdmin.from("cart_items").delete().eq("user_id", user.id);

    return NextResponse.json(
      {
        success: true,
        order_id: order.id,
        total: order.total,
        status: order.status,
        message: "سفارش با موفقیت ثبت شد",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const isAdmin = user.role === 'admin';

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
    .from("orders")
    .select(
      `
        id,
        user_id,
        total,
        status,
        created_at,
        users (
          id,
          email,
          full_name
        )
      `,
      { count: "exact" }
    );
  

    // Filter by user if not admin
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت سفارش‌ها' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}