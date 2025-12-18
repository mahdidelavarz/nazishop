import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

// Admin-only products API
// Base URL: /api/admin/products

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response; // 401 or 403

  try {
    // First, fetch products without nested query to avoid relationship issues
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, description, price, original_price, thumbnail_url, slug, brand, stock')
      .order('created_at', { ascending: false });

    if (productsError || !productsData) {
      console.error('Admin products GET error:', productsError);
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

    return NextResponse.json({ success: true, products: productsWithDetails || [] });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create new product
export async function POST(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!; // 401 or 403

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
    } = body;

    if (!title || !price || !stock || !slug) {
      return NextResponse.json(
        { success: false, message: 'عنوان، قیمت، موجودی و اسلاگ الزامی هستند' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
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
        created_at: new Date().toISOString(),
      })
      .select(
        'id, title, description, price, original_price, thumbnail_url, slug, brand, stock'
      )
      .single();

    if (error || !data) {
      console.error('Admin products POST error:', {
        error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
      });

      // Handle duplicate slug error (PostgreSQL unique constraint violation)
      if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری انتخاب کنید.',
            details: 'Slug already exists',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          message: 'خطا در ایجاد محصول',
          details: error?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Save images to product_details if provided
    const images = body.images;
    if (images && Array.isArray(images) && images.length > 0) {
      console.log('Saving images to product_details:', {
        productId: data.id,
        images,
      });

      // Check if product_details record exists (using maybeSingle to avoid error if not found)
      const { data: existingDetails, error: checkError } = await supabaseAdmin
        .from('product_details')
        .select('id')
        .eq('product_id', data.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking product_details:', checkError);
      }

      if (existingDetails) {
        // Update existing product_details
        const { error: updateError } = await supabaseAdmin
          .from('product_details')
          .update({ images })
          .eq('product_id', data.id);
        
        if (updateError) {
          console.error('Error updating product_details:', updateError);
          // Don't fail the whole request if product_details update fails
        } else {
          console.log('Successfully updated product_details with images');
        }
      } else {
        // Create new product_details record
        const { error: insertError } = await supabaseAdmin
          .from('product_details')
          .insert({
            product_id: data.id,
            images,
          });
        
        if (insertError) {
          console.error('Error inserting product_details:', insertError);
          // Don't fail the whole request if product_details insert fails
          // The product was created successfully, just log the error
        } else {
          console.log('Successfully created product_details with images');
        }
      }
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    console.error('Admin products POST catch error:', {
      error,
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        details: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Update existing product
export async function PUT(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response; // 401 or 403

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(
        'id, title, description, price, original_price, thumbnail_url, slug, brand, stock'
      )
      .single();

    if (error || !data) {
      console.error('Admin products PUT error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Admin products PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response; // 401 or 403

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Admin products DELETE error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در حذف محصول' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin products DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
