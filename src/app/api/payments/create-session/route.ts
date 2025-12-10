import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { verifyAccessToken } from "@/shared/lib/jwt/jwt";

// POST /api/payments/create-session - Create payment session
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
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: "شناسه سفارش الزامی است" },
        { status: 400 }
      );
    }

    // Fetch order and verify ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total, status')
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

    // Check if order can be paid
    if (order.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `امکان پرداخت برای سفارش با وضعیت ${order.status} وجود ندارد` },
        { status: 400 }
      );
    }

    // Generate fake payment session
    const paymentSession = {
      success: true,
      session_id: `session_${Math.random().toString(36).substr(2, 9)}`,
      order_id: order.id,
      amount: order.total,
      currency: 'IRR',
      payment_url: `/payment/${order.id}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    return NextResponse.json(paymentSession, { status: 201 });

  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}