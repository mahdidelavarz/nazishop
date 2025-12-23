import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch single brand
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { id } = await params;

    const { data: brand, error } = await supabaseAdmin
      .from('brands')
      .select('id, name, logo, slug, sort_order, created_at')
      .eq('id', id)
      .single();

    if (error || !brand) {
      return NextResponse.json(
        { success: false, message: 'برند یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error('Brand GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete brand
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

  try {
    const { id } = await params;

    // Get brand name first
    const { data: brand } = await supabaseAdmin
      .from('brands')
      .select('name')
      .eq('id', id)
      .single();

    if (!brand) {
      return NextResponse.json(
        { success: false, message: 'برند یافت نشد' },
        { status: 404 }
      );
    }

    // Check if brand has products
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('brand', brand.name);

    if (countError) {
      console.error('Error checking products:', countError);
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `نمی‌توان این برند را حذف کرد. ${count} محصول به آن مرتبط است.`,
        },
        { status: 400 }
      );
    }

    // Delete brand
    const { error } = await supabaseAdmin
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Brand deletion error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در حذف برند' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'برند با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Brand DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

