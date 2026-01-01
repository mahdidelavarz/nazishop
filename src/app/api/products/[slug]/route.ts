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
        brand:brands(name),
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
    // Note: Supabase returns related data as array when using foreign key relation
    const detailsData = Array.isArray(data.details) ? data.details[0] : data.details;

    const product = {
      ...data,
      brand: data.brand?.name ?? null,
      product_details: detailsData ? {
        description: detailsData.description,
        specifications: detailsData.specifications,
        images: detailsData.images,
        extra_info: detailsData.extra_info || null,
        weight: detailsData.weight || null,
        dimensions: detailsData.dimensions || null,
        video_url: detailsData.video_url || null,
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


