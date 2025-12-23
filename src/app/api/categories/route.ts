import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function GET() {
  try {
    // Fetch categories with product count
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name, icon, color, slug, image, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Categories fetch error:', categoriesError);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت دسته‌بندی‌ها' },
        { status: 500 }
      );
    }

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count, error: countError } = await supabaseAdmin
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_public', true);

        if (countError) {
          console.error(`Error counting products for category ${category.id}:`, countError);
        }

        return {
          ...category,
          count: count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

