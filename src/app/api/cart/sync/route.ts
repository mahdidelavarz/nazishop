// app/api/cart/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/server'
import { requireUser } from '@/shared/lib/auth/serverAuth'

interface GuestCartItem {
  product_id: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser(request)
    if (response || !user) return response!

    const userId = user.id

    const { items } = await request.json() as { items: GuestCartItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'سبد خرید خالی است' },
        { status: 400 }
      )
    }

    const synced: string[] = []
    const errors: { productId: string; message: string }[] = []

    // Process each item
    for (const item of items) {
      try {
        // Validate product exists and has stock
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select('id, stock')
          .eq('id', item.product_id)
          .single()

        if (productError || !product) {
          errors.push({
            productId: item.product_id,
            message: 'محصول یافت نشد'
          })
          continue
        }

        if (product.stock < item.quantity) {
          errors.push({
            productId: item.product_id,
            message: 'موجودی کافی نیست'
          })
          continue
        }

        // Check if already in cart
        const { data: existing, error: checkError } = await supabaseAdmin
          .from('cart_items')
          .select('id, quantity')
          .eq('product_id', item.product_id)
          .eq('user_id', userId)
          .maybeSingle()

        if (checkError) {
          console.error('Check cart error:', checkError)
          errors.push({
            productId: item.product_id,
            message: 'خطا در بررسی سبد خرید'
          })
          continue
        }

        if (existing) {
          // Update quantity
          const newQuantity = existing.quantity + item.quantity
          const finalQuantity = Math.min(newQuantity, product.stock)

          const { error: updateError } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity: finalQuantity })
            .eq('id', existing.id)

          if (updateError) {
            console.error('Update error:', updateError)
            errors.push({
              productId: item.product_id,
              message: 'خطا در بروزرسانی'
            })
            continue
          }
        } else {
          // Insert new item
          const { error: insertError } = await supabaseAdmin
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: item.product_id,
              quantity: Math.min(item.quantity, product.stock)
            })

          if (insertError) {
            console.error('Insert error:', insertError)
            errors.push({
              productId: item.product_id,
              message: 'خطا در افزودن به سبد'
            })
            continue
          }
        }

        synced.push(item.product_id)
      } catch (error: unknown) {
        console.error(`Error processing item ${item.product_id}:`, error)
        const message =
          error instanceof Error ? error.message : 'خطای ناشناخته'
        errors.push({
          productId: item.product_id,
          message,
        })
      }
    }

    // Return results
    if (synced.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'همگام‌سازی ناموفق بود',
          errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      synced: synced.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: unknown) {
    console.error('Sync cart error:', error)
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    )
  }
}