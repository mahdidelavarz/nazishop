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

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products:products(id, title, price, thumbnail_url)
      `)
      .eq('user_id', payload.userId)
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

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات نامعتبر است' },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, stock')
      .eq('id', productId)
      .single();

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

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('product_id', productId)
      .eq('user_id', payload.userId)
      .maybeSingle();

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
          user_id: payload.userId,
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

