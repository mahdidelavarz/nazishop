import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { requireAdmin } from "@/shared/lib/auth/serverAuth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

// PATCH /api/orders/[id]/status - Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { response } = await requireAdmin(request);
    if (response) return response;

    const body = await request.json();
    const { status, tracking_code } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'وضعیت الزامی است' },
        { status: 400 }
      );
    }

    // Get current order status
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { success: false, message: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[currentOrder.status] || [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          message: `تغییر وضعیت از ${currentOrder.status} به ${status} مجاز نیست`,
          allowed: allowedTransitions
        },
        { status: 400 }
      );
    }

    // Update order
    const updateData: any = {
      status
    };

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        user_id,
        total,
        status,
        shipping_method,
        shipping_cost,
        shipping_full_name,
        shipping_phone,
        shipping_address_line,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        created_at,
        users!inner(
          id,
          email,
          full_name,
          phone_number
        )
      `)
      .single();

    if (error || !data) {
      console.error('Order update error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی سفارش' },
        { status: 500 }
      );
    }

    // Fetch order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        product_id,
        quantity,
        price_at_purchase,
        products:products(id, title, thumbnail_url)
      `)
      .eq('order_id', id);

    const orderData = data as unknown as Record<string, unknown>;

    return NextResponse.json({
      success: true,
      order: data ? { ...orderData, items: items || [] } : null,
      message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}