import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function GET() {
  try {
    // First, fetch products without nested query to avoid relationship issues
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, description, price, original_price, thumbnail_url, slug, brand, stock')
      .order('created_at', { ascending: false });

    if (productsError || !productsData) {
      console.error('Fetch products error:', productsError);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت محصولات' },
        { status: 500 }
      );
    }

    // Then, fetch product_details separately and merge
    const productIds = productsData.map(p => p.id);
    const { data: detailsData } = await supabaseAdmin
      .from('product_details')
      .select('product_id, images')
      .in('product_id', productIds);

    // Merge product_details with products
    const productsWithDetails = productsData.map(product => {
      const details = detailsData?.find(d => d.product_id === product.id);
      return {
        ...product,
        details: details ? [{ images: details.images || [] }] : null,
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithDetails || [],
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


