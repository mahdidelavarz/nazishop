import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

// Admin-only products API
// Base URL: /api/admin/products

// GET - Fetch all products (admin view)
export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        slug,
        price,
        original_price,
        discount_percent,
        stock,
        brand,
        thumbnail_url,
        is_public,
        sku,
        category_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin products GET error:', error);
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
    console.error('Admin products GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

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
      sku,
      tags,
      category_id,
      is_public,
      images,
    } = body;

    // Validation
    if (!title || price === undefined || stock === undefined || !slug) {
      return NextResponse.json(
        { success: false, message: 'عنوان، قیمت، موجودی و اسلاگ الزامی هستند' },
        { status: 400 }
      );
    }

    // Create product
    const { data: product, error: productError } = await supabaseAdmin
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
        sku: sku ?? null,
        tags: tags ?? null,
        category_id: category_id ?? null,
        is_public: is_public ?? true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (productError || !product) {
      console.error('Admin products POST error:', productError);

      // Handle duplicate slug error
      if (productError?.code === '23505' || productError?.message?.includes('duplicate key')) {
        return NextResponse.json(
          {
            success: false,
            message: 'این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری انتخاب کنید.',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'خطا در ایجاد محصول' },
        { status: 500 }
      );
    }

    // Save images to product_details if provided
    if (images && Array.isArray(images) && images.length > 0) {
      const { error: detailsError } = await supabaseAdmin
        .from('product_details')
        .insert({
          product_id: product.id,
          images,
        });

      if (detailsError) {
        console.error('Error creating product_details:', detailsError);
        // Don't fail the request, product was created successfully
      }
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Admin products POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing product
export async function PUT(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    // Remove undefined values and images from updates (images go to product_details)
    const cleanUpdates: {
      title?: string;
      description?: string | null;
      price?: number;
      original_price?: number | null;
      stock?: number;
      brand?: string | null;
      thumbnail_url?: string | null;
      sku?: string | null;
      tags?: string[] | null;
      category_id?: string | null;
      is_public?: boolean;
    } = {};
    const allowedFields = [
      'title',
      'description',
      'price',
      'original_price',
      'stock',
      'brand',
      'thumbnail_url',
      'sku',
      'tags',
      'category_id',
      'is_public',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        cleanUpdates[field as keyof typeof cleanUpdates] = updates[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(cleanUpdates as any)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Admin products PUT error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    console.error('Admin products PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
