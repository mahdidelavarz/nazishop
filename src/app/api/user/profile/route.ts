// app/api/user/profile/route.ts (Example)
import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'
import { getSessionFromRequest } from '@/features/auth/utils/sessionUtils'

export async function GET(request: NextRequest) {
    try {
        // Verify session
        const session = getSessionFromRequest(request)

        if (!session) {
            return NextResponse.json(
                { error: 'غیرمجاز - لطفا وارد شوید' },
                { status: 401 }
            )
        }

        // Get user data
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', session.userId)
            .single()

        if (error || !user) {
            return NextResponse.json(
                { error: 'کاربر یافت نشد' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            user
        })

    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { error: 'خطای سرور' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Verify session
        const session = getSessionFromRequest(request)

        if (!session) {
            return NextResponse.json(
                { error: 'غیرمجاز - لطفا وارد شوید' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { full_name, address, postal_code, birthday } = body

        // Validate required fields
        if (!full_name || !address) {
            return NextResponse.json(
                { error: 'نام و آدرس الزامی است' },
                { status: 400 }
            )
        }

        // Update user
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({
                full_name,
                address,
                postal_code,
                birthday,
                profile_completed: true
            })
            .eq('id', session.userId)
            .select()
            .single()

        if (error) {
            console.error('Update error:', error)
            return NextResponse.json(
                { error: 'خطا در بروزرسانی پروفایل' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            user: data
        })

    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: 'خطای سرور' },
            { status: 500 }
        )
    }
}