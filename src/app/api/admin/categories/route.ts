import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

// Admin-only categories API
// Base URL: /api/admin/categories

// GET - Fetch all categories (admin view)
export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, icon, color, slug, image, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Admin categories GET error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت دسته‌بندی‌ها' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: data || [],
    });
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

  try {
    const body = await req.json();
    const { name, image, icon, color, slug, sort_order } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'نام دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    // Check if slug already exists (if provided)
    if (slug) {
      const { data: existing } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'این slug قبلا استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // Insert category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: name.trim(),
        image: image || null,
        icon: icon || null,
        color: color || null,
        slug: slug?.trim() || null,
        sort_order: sort_order ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Category creation error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در ایجاد دسته‌بندی' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
      message: 'دسته‌بندی با موفقیت ایجاد شد',
    });
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

  try {
    const body = await req.json();
    const { id, name, image, icon, color, slug, sort_order } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    // Check if category exists
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    // Check if slug already exists (if provided and changed)
    if (slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'این slug قبلا استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (slug !== undefined) updateData.slug = slug?.trim() || null;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Update category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Category update error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی دسته‌بندی' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

