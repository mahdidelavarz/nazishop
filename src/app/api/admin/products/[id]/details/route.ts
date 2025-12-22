import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch product details
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { id: productId } = await params;

    const { data, error } = await supabaseAdmin
      .from('product_details')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      console.error('Fetch product details error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت جزئیات محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      details: data,
    });
  } catch (error) {
    console.error('Product details GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update product details
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { id: productId } = await params;
    const body = await req.json();
    const {
      description,
      specifications,
      images,
      extra_info,
      weight,
      dimensions,
      video_url,
    } = body;

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    // Check if details already exist
    const { data: existingDetails } = await supabaseAdmin
      .from('product_details')
      .select('id')
      .eq('product_id', productId)
      .maybeSingle();

    const detailsData = {
      product_id: productId,
      description: description ?? null,
      specifications: specifications ?? null,
      images: images ?? null,
      extra_info: extra_info ?? null,
      weight: weight ?? null,
      dimensions: dimensions ?? null,
      video_url: video_url ?? null,
    };

    let result;
    if (existingDetails) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('product_details')
        .update(detailsData)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) {
        console.error('Update product details error:', error);
        return NextResponse.json(
          { success: false, message: 'خطا در به‌روزرسانی جزئیات محصول' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from('product_details')
        .insert(detailsData)
        .select()
        .single();

      if (error) {
        console.error('Create product details error:', error);
        return NextResponse.json(
          { success: false, message: 'خطا در ایجاد جزئیات محصول' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      details: result,
    });
  } catch (error) {
    console.error('Product details POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

