import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'


/**
 * Supabase Server Admin Client
 * Used for server-side operations with elevated privileges
 * Uses service role key - NEVER expose to client
 * Bypasses Row Level Security (RLS)
 */

type TypedSupabaseAdmin = SupabaseClient<Database>

let adminClient: TypedSupabaseAdmin | null = null

/**
 * Get Supabase Admin Client (Singleton)
 * Creates a client with service role key for admin operations
 * 
 * @returns Supabase admin client instance
 * @throws Error if environment variables are missing
 */
export function getSupabaseAdminClient(): TypedSupabaseAdmin {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-application-name': 'ecommerce-shop-admin',
      },
    },
    db: {
      schema: 'public',
    },
  })

  return adminClient
}

/**
 * Clear Supabase admin client (useful for testing)
 */
export function clearSupabaseAdminClient(): void {
  adminClient = null
}

/**
 * Export singleton instance
 * Usage in API routes: import { supabaseAdmin } from '@/shared/lib/supabase/server'
 */
export const supabaseAdmin = getSupabaseAdminClient()