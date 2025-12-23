import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function GET() {
  try {
    // Fetch brands with product count
    const { data: brands, error: brandsError } = await supabaseAdmin
      .from('brands')
      .select('id, name, logo, slug, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (brandsError) {
      console.error('Brands fetch error:', brandsError);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت برندها' },
        { status: 500 }
      );
    }

    // Get product counts for each brand
    const brandsWithCounts = await Promise.all(
      (brands || []).map(async (brand) => {
        const { count, error: countError } = await supabaseAdmin
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('brand', brand.name)
          .eq('is_public', true);

        if (countError) {
          console.error(`Error counting products for brand ${brand.id}:`, countError);
        }

        return {
          ...brand,
          count: count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      brands: brandsWithCounts,
    });
  } catch (error) {
    console.error('Brands GET error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

