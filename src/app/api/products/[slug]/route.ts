import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/supabase';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select(
        `
        id,
        title,
        description,
        price,
        original_price,
        brand,
        stock,
        thumbnail_url,
        slug,
        details:product_details(description, specifications, images)
      `
      )
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Fetch product error:', error);
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
    console.error('Product GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


