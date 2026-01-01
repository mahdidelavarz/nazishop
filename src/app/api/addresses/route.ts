import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

// GET /api/addresses - List user addresses
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { data: addresses, error } = await supabaseAdmin
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Addresses fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت آدرس‌ها' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: addresses || [],
    });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const body = await request.json();
    const {
      label,
      full_name,
      phone_number,
      address_line,
      city,
      state,
      postal_code,
      country = 'ایران',
      is_default = false,
    } = body;

    // Validation
    if (!full_name || !address_line) {
      return NextResponse.json(
        { success: false, message: 'نام و آدرس الزامی است' },
        { status: 400 }
      );
    }

    // If this is the first address or is_default is true, unset other defaults
    if (is_default) {
      await supabaseAdmin
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    // Check if this is the first address
    const { count } = await supabaseAdmin
      .from('user_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const shouldBeDefault = is_default || count === 0;

    // Create address
    const { data: address, error } = await supabaseAdmin
      .from('user_addresses')
      .insert({
        user_id: user.id,
        label,
        full_name,
        phone_number,
        address_line,
        city,
        state,
        postal_code,
        country,
        is_default: shouldBeDefault,
      })
      .select()
      .single();

    if (error || !address) {
      console.error('Address creation error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در ایجاد آدرس' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        address,
        message: 'آدرس با موفقیت اضافه شد',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Address creation error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

