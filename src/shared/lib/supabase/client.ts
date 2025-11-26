
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

/**
 * Supabase Browser Client
 * Used for client-side operations (React components, hooks)
 * Uses anon key for public access with RLS
 */

type TypedSupabaseClient = SupabaseClient<Database>

let client: TypedSupabaseClient | null = null

/**
 * Get Supabase Browser Client (Singleton)
 * Creates a client instance for browser-side operations
 * 
 * @returns Supabase client instance
 * @throws Error if environment variables are missing
 */
export function getSupabaseBrowserClient(): TypedSupabaseClient {
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
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-application-name': 'ecommerce-shop-browser',
      },
    },
    db: {
      schema: 'public',
    },
  })

  return client
}

/**
 * Clear Supabase client (useful for testing)
 */
export function clearSupabaseBrowserClient(): void {
  client = null
}

/**
 * Export singleton instance
 * Usage in components: import { supabase } from '@/shared/lib/supabase/client'
 */
export const supabase = getSupabaseBrowserClient()