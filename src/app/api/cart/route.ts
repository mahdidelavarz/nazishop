import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products:products(id, title, price, discount:discount_percent, thumbnail_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch cart error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت سبد خرید' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: data || [],
    });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request);
    if (response || !user) return response!;

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات نامعتبر است' },
        { status: 400 }
      );
    }

    const [productResult, existingResult] = await Promise.all([
      supabaseAdmin
        .from('products')
        .select('id, stock')
        .eq('id', productId)
        .single(),
      supabaseAdmin
        .from('cart_items')
        .select('id, quantity')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    const { data: product, error: productError } = productResult;

    if (productError || !product) {
      return NextResponse.json(
        { success: false, message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: 'موجودی کافی نیست' },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = existingResult;

    if (existingError) {
      console.error('Check cart error:', existingError);
      return NextResponse.json(
        { success: false, message: 'خطا در بررسی سبد خرید' },
        { status: 500 }
      );
    }

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, message: 'تعداد درخواستی بیش از موجودی انبار است' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update cart error:', updateError);
        return NextResponse.json(
          { success: false, message: 'خطا در بروزرسانی سبد خرید' },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

      if (insertError) {
        console.error('Insert cart error:', insertError);
        return NextResponse.json(
          { success: false, message: 'خطا در افزودن به سبد خرید' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'سبد خرید به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

