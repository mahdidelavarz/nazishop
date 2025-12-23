import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

// Admin-only brands API
// Base URL: /api/admin/brands

// GET - Fetch all brands (admin view)
export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const { data, error } = await supabaseAdmin
      .from('brands')
      .select('id, name, logo, slug, sort_order, created_at')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Admin brands GET error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در دریافت برندها' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brands: data || [],
    });
  } catch (error) {
    console.error('Admin brands GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create new brand
export async function POST(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

  try {
    const body = await req.json();
    const { name, logo, slug, sort_order } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'نام برند الزامی است' },
        { status: 400 }
      );
    }

    // Check if slug already exists (if provided)
    if (slug) {
      const { data: existing } = await supabaseAdmin
        .from('brands')
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

    // Check if brand name already exists
    const { data: existingName } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existingName) {
      return NextResponse.json(
        { success: false, message: 'این برند قبلا ثبت شده است' },
        { status: 400 }
      );
    }

    // Insert brand
    const { data: brand, error } = await supabaseAdmin
      .from('brands')
      .insert({
        name: name.trim(),
        logo: logo || null,
        slug: slug?.trim() || null,
        sort_order: sort_order ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Brand creation error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در ایجاد برند' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand,
      message: 'برند با موفقیت ایجاد شد',
    });
  } catch (error) {
    console.error('Brand POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update brand
export async function PUT(req: NextRequest) {
  const { response, user } = await requireAdmin(req);
  if (response || !user) return response!;

  try {
    const body = await req.json();
    const { id, name, logo, slug, sort_order } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه برند الزامی است' },
        { status: 400 }
      );
    }

    // Check if brand exists
    const { data: existing } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'برند یافت نشد' },
        { status: 404 }
      );
    }

    // Check if slug already exists (if provided and changed)
    if (slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('brands')
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

    // Check if name already exists (if changed)
    if (name && name.trim() !== existing.name) {
      const { data: nameExists } = await supabaseAdmin
        .from('brands')
        .select('id')
        .eq('name', name.trim())
        .neq('id', id)
        .single();

      if (nameExists) {
        return NextResponse.json(
          { success: false, message: 'این نام برند قبلا استفاده شده است' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (logo !== undefined) updateData.logo = logo;
    if (slug !== undefined) updateData.slug = slug?.trim() || null;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Update brand
    const { data: brand, error } = await supabaseAdmin
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Brand update error:', error);
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی برند' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand,
      message: 'برند با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Brand PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

