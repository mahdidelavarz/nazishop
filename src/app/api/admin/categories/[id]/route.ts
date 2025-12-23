import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch single category
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { id } = await params;

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, icon, color, slug, image, sort_order')
      .eq('id', id)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Category GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

  try {
    const { id } = await params;

    // Check if category has products
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      console.error('Error checking products:', countError);
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `نمی‌توان این دسته‌بندی را حذف کرد. ${count} محصول به آن مرتبط است.`,
        },
        { status: 400 }
      );
    }

    // Delete category
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Category deletion error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در حذف دسته‌بندی' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

