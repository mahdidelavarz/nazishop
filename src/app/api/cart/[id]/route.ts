import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'تعداد نامعتبر است' },
        { status: 400 }
      );
    }

    const { data: cartItem, error: fetchError } = await supabaseAdmin
      .from('cart_items')
      .select('id, user_id, product_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !cartItem) {
      return NextResponse.json(
        { success: false, message: 'محصول در سبد خرید یافت نشد' },
        { status: 404 }
      );
    }

    if (cartItem.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    // Validate stock before updating
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('id', cartItem.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { success: false, message: 'تعداد درخواستی بیش از موجودی انبار است' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', id);

    if (updateError) {
      console.error('Update cart error:', updateError);
      return NextResponse.json(
        { success: false, message: 'خطا در بروزرسانی سبد خرید' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'سبد خرید به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Cart PATCH error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { data: cartItem, error: fetchError } = await supabaseAdmin
      .from('cart_items')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !cartItem) {
      return NextResponse.json(
        { success: false, message: 'محصول در سبد خرید یافت نشد' },
        { status: 404 }
      );
    }

    if (cartItem.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete cart error:', deleteError);
      return NextResponse.json(
        { success: false, message: 'خطا در حذف محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'محصول از سبد خرید حذف شد',
    });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

