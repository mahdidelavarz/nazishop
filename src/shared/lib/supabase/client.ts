// src/shared/lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'



/**
 * Supabase Browser Client
 * Used for client-side operations (React components, hooks)
 * Uses anon key for public access with RLS
 */

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
    if (client) {
        return client
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
        )
    }

    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce', // More secure OAuth flow
        },
        global: {
            headers: {
                'x-application-name': 'nazi-shop-browser',
            },
        },
    })

    return client
}

/**
 * Export singleton instance
 * Usage in components: import { supabase } from '@/shared/lib/supabase/client'
 */
export const supabase = getSupabaseBrowserClient()

/**
 * Helper: Check if user is authenticated (has valid Supabase session)
 * Note: This is for OAuth users only. OTP users won't have Supabase auth session.
 */
export async function isSupabaseAuthenticated(): Promise<boolean> {
    const {
        data: { session },
    } = await supabase.auth.getSession()
    return !!session
}

/**
 * Helper: Get current Supabase user (OAuth users only)
 */
export async function getCurrentSupabaseUser() {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}

/**
 * Helper: Sign out from Supabase (OAuth users only)
 */
export async function signOutSupabase() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Supabase sign out error:', error)
        throw error
    }
}