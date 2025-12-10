import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { verifyAccessToken } from "@/shared/lib/jwt/jwt";

// POST /api/payments/verify - Verify payment
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

    const body = await request.json();
    const { order_id, success: paymentSuccess } = body;

    if (!order_id || typeof paymentSuccess !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'اطلاعات پرداخت نامعتبر است' },
        { status: 400 }
      );
    }

    // Fetch order and verify ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (order.user_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    // Update order based on payment success
    const newStatus = paymentSuccess ? 'paid' : 'pending';
    
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: newStatus
      })
      .eq('id', order_id)
      .select(`
        id,
        user_id,
        total,
        status,
        created_at,
        users!inner(
          id,
          email,
          full_name
        )
      `)
      .single();

    if (updateError || !updatedOrder) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی وضعیت سفارش' },
        { status: 500 }
      );
    }

    // Fetch order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    const orderData = updatedOrder as unknown as Record<string, unknown>;

    return NextResponse.json({
      success: true,
      order: updatedOrder ? { ...orderData, items: items || [] } : null,
      message: paymentSuccess ? 'پرداخت با موفقیت انجام شد' : 'پرداخت ناموفق بود - سفارش به حالت در انتظار بازگشت'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}