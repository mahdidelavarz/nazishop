import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, title, description, price, original_price, thumbnail_url, slug, brand, stock')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch products error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت محصولات' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: data || [],
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


