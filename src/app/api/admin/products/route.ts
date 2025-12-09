import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/supabase';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';

// Admin-only products API
// Base URL: /api/admin/products

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response; // 401 or 403

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(
        'id, title, description, price, original_price, thumbnail_url, slug, brand, stock'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin products GET error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت محصولات' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create new product
export async function POST(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!; // 401 or 403

  try {
    const body = await req.json();
    const {
      title,
      description,
      price,
      original_price,
      stock,
      brand,
      thumbnail_url,
      slug,
    } = body;

    if (!title || !price || !stock || !slug) {
      return NextResponse.json(
        { success: false, message: 'عنوان، قیمت، موجودی و اسلاگ الزامی هستند' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        description: description ?? null,
        price,
        original_price: original_price ?? null,
        stock,
        brand: brand ?? null,
        thumbnail_url: thumbnail_url ?? null,
        slug,
      })
      .select(
        'id, title, description, price, original_price, thumbnail_url, slug, brand, stock'
      )
      .single();

    if (error || !data) {
      console.error('Admin products POST error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در ایجاد محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Admin products POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Update existing product
export async function PUT(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response; // 401 or 403

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(
        'id, title, description, price, original_price, thumbnail_url, slug, brand, stock'
      )
      .single();

    if (error || !data) {
      console.error('Admin products PUT error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Admin products PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response; // 401 or 403

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin products DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
