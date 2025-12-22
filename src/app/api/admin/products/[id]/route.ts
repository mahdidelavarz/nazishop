import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE - Delete product
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    // Delete product_details first (if exists)
    await supabaseAdmin
      .from('product_details')
      .delete()
      .eq('product_id', id);

    // Delete the product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Admin products DELETE error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در حذف محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'محصول با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Admin products DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// GET - Get single product by ID (for admin)
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    console.error('Admin product GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

