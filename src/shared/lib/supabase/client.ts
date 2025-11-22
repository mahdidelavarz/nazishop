// src/shared/lib/supabase/client.ts

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

// ==================== AUTH HELPERS ====================

/**
 * Check if user is authenticated (has valid Supabase session)
 * Note: This is for OAuth users only. OTP users won't have Supabase auth session.
 * 
 * @returns Promise resolving to authentication status
 */
export async function isSupabaseAuthenticated(): Promise<boolean> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error checking Supabase authentication:', error)
      return false
    }

    return !!session
  } catch (error) {
    console.error('Exception checking Supabase authentication:', error)
    return false
  }
}

/**
 * Get current Supabase user (OAuth users only)
 * 
 * @returns Promise resolving to user or null
 */
export async function getCurrentSupabaseUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current Supabase user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Exception getting current Supabase user:', error)
    return null
  }
}

/**
 * Get current Supabase session
 * 
 * @returns Promise resolving to session or null
 */
export async function getCurrentSupabaseSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting current Supabase session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Exception getting current Supabase session:', error)
    return null
  }
}

/**
 * Sign out from Supabase (OAuth users only)
 * 
 * @returns Promise resolving to success status
 */
export async function signOutSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase sign out error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception during Supabase sign out:', error)
    return false
  }
}

/**
 * Listen to auth state changes
 * 
 * @param callback - Callback function to handle auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return () => {
    subscription.unsubscribe()
  }
}

// ==================== PUBLIC DATA HELPERS ====================

/**
 * Get public user profile by ID
 * Note: This respects RLS, only returns data user has access to
 * 
 * @param userId - User ID to fetch
 * @returns Promise resolving to user data or null
 */
export async function getPublicUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone_number, role, profile_completed, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116 = not found
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching public user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Exception fetching public user profile:', error)
    return null
  }
}

/**
 * Get products with optional filters
 * Public endpoint with RLS
 * 
 * @param options - Query options (limit, offset, filters)
 * @returns Promise resolving to products array
 */
export async function getProducts(options?: {
  limit?: number
  offset?: number
  categoryId?: string
  isPublic?: boolean
}) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    if (options?.isPublic !== undefined) {
      query = query.eq('is_public', options.isPublic)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching products:', error)
    return []
  }
}

/**
 * Get product by ID
 * 
 * @param productId - Product ID to fetch
 * @returns Promise resolving to product data or null
 */
export async function getProductById(productId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_details(*)')
      .eq('id', productId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching product:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Exception fetching product:', error)
    return null
  }
}

/**
 * Get categories
 * 
 * @returns Promise resolving to categories array
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching categories:', error)
    return []
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if Supabase is available
 * 
 * @returns Promise resolving to availability status
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    return false
  }
}

/**
 * Get Supabase client version info
 * 
 * @returns Client version information
 */
export function getSupabaseClientInfo() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not-set',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    isInitialized: !!client,
  }
}