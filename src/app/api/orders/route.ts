import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/serverAuth";

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const body = await request.json();
    const { address_id, shipping_method = 'standard' } = body;

    // Validate address_id is provided
    if (!address_id) {
      return NextResponse.json(
        { success: false, message: "لطفا یک آدرس انتخاب کنید" },
        { status: 400 }
      );
    }

    // Fetch the selected address
    const { data: address, error: addressError } = await supabaseAdmin
      .from("user_addresses")
      .select("*")
      .eq("id", address_id)
      .eq("user_id", user.id)
      .single();

    if (addressError || !address) {
      return NextResponse.json(
        { success: false, message: "آدرس انتخاب شده یافت نشد" },
        { status: 400 }
      );
    }

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

    // Calculate shipping cost based on method
    const shippingCosts: Record<string, number> = {
      standard: 50000,
      express: 150000,
      overnight: 250000,
    };
    const shippingCost = shippingCosts[shipping_method] || 50000;

    const itemsTotal = cartItems.reduce((sum, item) => {
      const basePrice = item.products?.price ?? 0;
      const discount = item.products?.discount_percent ?? 0;
      const finalPrice =
        discount && discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
      return sum + finalPrice * item.quantity;
    }, 0);

    const total = itemsTotal + shippingCost;

    // Insert order with address snapshot
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "pending",
        shipping_method,
        shipping_cost: shippingCost,
        // Address snapshot (immutable)
        shipping_full_name: address.full_name,
        shipping_phone: address.phone_number,
        shipping_address_line: address.address_line,
        shipping_city: address.city,
        shipping_state: address.state,
        shipping_postal_code: address.postal_code,
        shipping_country: address.country || 'ایران',
      })
      .select("id, total, status, created_at, shipping_method, shipping_cost")
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