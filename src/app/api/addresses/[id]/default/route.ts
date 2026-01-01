import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/addresses/[id]/default - Set address as default
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('user_addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'آدرس یافت نشد' },
        { status: 404 }
      );
    }

    // Unset all other defaults
    await supabaseAdmin
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id);

    // Set this one as default
    const { data: address, error } = await supabaseAdmin
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !address) {
      console.error('Set default address error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در تنظیم آدرس پیش‌فرض' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
      message: 'آدرس پیش‌فرض تنظیم شد',
    });
  } catch (error) {
    console.error('Set default address error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

