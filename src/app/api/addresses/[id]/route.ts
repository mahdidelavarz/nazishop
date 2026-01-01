import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/addresses/[id] - Get single address
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { data: address, error } = await supabaseAdmin
      .from('user_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !address) {
      return NextResponse.json(
        { success: false, message: 'آدرس یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// PATCH /api/addresses/[id] - Update address
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

    const body = await request.json();
    const {
      label,
      full_name,
      phone_number,
      address_line,
      city,
      state,
      postal_code,
      country,
      is_default,
    } = body;

    // If setting as default, unset other defaults
    if (is_default) {
      await supabaseAdmin
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', id);
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (address_line !== undefined) updateData.address_line = address_line;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (country !== undefined) updateData.country = country;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data: address, error } = await supabaseAdmin
      .from('user_addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !address) {
      console.error('Address update error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در بروزرسانی آدرس' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
      message: 'آدرس با موفقیت بروزرسانی شد',
    });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    // Check ownership and get is_default status
    const { data: existing } = await supabaseAdmin
      .from('user_addresses')
      .select('id, is_default')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'آدرس یافت نشد' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Address delete error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در حذف آدرس' },
        { status: 500 }
      );
    }

    // If deleted address was default, set another one as default
    if (existing.is_default) {
      const { data: remaining } = await supabaseAdmin
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (remaining) {
        await supabaseAdmin
          .from('user_addresses')
          .update({ is_default: true })
          .eq('id', remaining.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'آدرس با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

