import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

// Ensure Node.js runtime
export const runtime = 'nodejs';

// Upload brand logo to Supabase Storage
// URL: /api/admin/brands/upload

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) {
    return response;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایلی ارسال نشده است' },
        { status: 400 }
      );
    }

    // Use dedicated brand-logos bucket
    const bucket = 'brand-logos';
    const fileExt = file.name.split('.').pop() || 'bin';
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${fileExt}`;
    const filePath = uniqueName;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (error || !data) {
      console.error('Brand logo upload error:', {
        error,
        errorMessage: error?.message,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      return NextResponse.json(
        {
          success: false,
          message: 'خطا در آپلود لوگو',
          details: error?.message || JSON.stringify(error),
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Brand logo upload server error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

