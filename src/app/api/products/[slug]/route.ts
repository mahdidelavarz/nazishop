import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

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
        rating,
        reviews_count,
        discount_percent,
        details:product_details(description, specifications, images, extra_info, weight, dimensions, video_url)
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

    // Transform the response to match the expected structure
    const product = {
      ...data,
      product_details: data.details ? {
        description: data.details.description,
        specifications: data.details.specifications,
        images: data.details.images,
        extra_info: data.details.extra_info || null,
        weight: data.details.weight || null,
        dimensions: data.details.dimensions || null,
        video_url: data.details.video_url || null,
      } : null,
    };

    // Remove the 'details' field as it's been transformed to 'product_details'
    delete (product as any).details;

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


