import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      title,
      slug,
      price,
      original_price,
      discount_percent,
      thumbnail_url,
      brand:brands(name),
      stock,
      rating,
      reviews_count
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت محصولات' },
      { status: 500 }
    );
  }

  // Transform brand from object to string
  const products = (data ?? []).map((product) => ({
    ...product,
    brand: product.brand?.name ?? null,
  }));

  return NextResponse.json({
    success: true,
    products,
  });
}



