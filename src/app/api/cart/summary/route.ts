import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { count, error } = await supabaseAdmin
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

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


