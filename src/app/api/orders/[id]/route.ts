import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { verifyAccessToken } from "@/shared/lib/jwt/jwt";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: rawId } = await params;
    const id = (rawId || "").trim();
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

    // Get user role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', payload.userId)
      .single();

    const isAdmin = userData?.role === 'admin';

    // Fetch order (without join to avoid accidental filtering)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total, status, created_at')
      .eq('id', id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // Check access control
    if (!isAdmin && order.user_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        product_id,
        quantity,
        price_at_purchase,
        products:products(id, title, thumbnail_url)
      `)
      .eq('order_id', id);

    if (itemsError) {
      console.error('Order items fetch error:', itemsError);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت اقلام سفارش' },
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
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}