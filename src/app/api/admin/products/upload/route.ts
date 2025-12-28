import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/shared/lib/auth/serverAuth';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

// Ensure Node.js runtime (so we have full compatibility with Supabase client)
export const runtime = 'nodejs';

// Upload product images to Supabase Storage
// URL: /api/admin/products/upload

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) {
    return response; // 401 or 403
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایلی ارسال نشده است' },
        { status: 400 }
      );
    }

    const bucket = 'product-images';
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const fileExt = file.name.split('.').pop() || 'bin';
      const uniqueName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}.${fileExt}`;
      const filePath = `products/${uniqueName}`;

      // In route handlers we should send an ArrayBuffer/Blob-like object to Supabase
      const arrayBuffer = await file.arrayBuffer();

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        });

      if (error || !data) {
        console.error('Product image upload error:', {
          error,
          errorMessage: error?.message,
          errorName: error?.name,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
        return NextResponse.json(
          {
            success: false,
            message: 'خطا در آپلود تصویر محصول',
            details: error?.message || JSON.stringify(error),
          },
          { status: 500 }
        );
      }

      // Get public URL - make sure bucket is public
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error('Product image upload server error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


