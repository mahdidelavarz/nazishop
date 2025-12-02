import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/shared/lib/jwt/jwt';
import { supabaseAdmin } from '@/shared/lib/supabase/supabase';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { count, error } = await supabaseAdmin
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', payload.userId);

    if (error) {
      console.error('Cart summary error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت تعداد سبد خرید' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalCount: count || 0,
    });
  } catch (error) {
    console.error('Cart summary GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


