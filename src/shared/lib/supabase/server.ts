// src/shared/lib/supabase/server.ts

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'



/**
 * Supabase Server Admin Client
 * Used for server-side operations with elevated privileges
 * Uses service role key - NEVER expose to client
 * Bypasses Row Level Security (RLS)
 */

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdminClient() {
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
        'x-application-name': 'nazi-shop-admin',
      },
    },
  })

  return adminClient
}

/**
 * Export singleton instance
 * Usage in API routes: import { supabaseAdmin } from '@/shared/lib/supabase/server'
 */
export const supabaseAdmin = getSupabaseAdminClient()

/**
 * Helper: Create user in public.users table
 * Used after OTP verification or OAuth callback
 */
export async function createUserRecord(data: {
  id: string
  phoneNumber?: string
  email?: string
  fullName?: string
  role?: 'customer' | 'admin'
}) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: data.id,
      phone_number: data.phoneNumber || null,
      email: data.email || null,
      full_name: data.fullName || null,
      role: data.role || 'customer',
      profile_completed: !!data.fullName,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user record:', error)
    throw error
  }

  return user
}

/**
 * Helper: Get user by phone number
 */
export async function getUserByPhone(phoneNumber: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is ok
    console.error('Error fetching user by phone:', error)
    throw error
  }

  return data
}

/**
 * Helper: Get user by email
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by email:', error)
    throw error
  }

  return data
}

/**
 * Helper: Get user by ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }

  return data
}

/**
 * Helper: Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string
    profile_completed: boolean
    email?: string
    phone_number?: string
    updated_at: string
  }
) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

/**
 * Helper: Store refresh token in database
 */
export async function storeRefreshToken(data: {
  userId: string
  tokenHash: string
  expiresAt: Date
}) {
  const { error } = await supabaseAdmin.from('refresh_tokens').insert({
    user_id: data.userId,
    token_hash: data.tokenHash,
    expires_at: data.expiresAt.toISOString(),
    revoked: false,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Error storing refresh token:', error)
    throw error
  }
}

/**
 * Helper: Check if refresh token is valid (not revoked, not expired)
 */
export async function isRefreshTokenValid(tokenHash: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('refresh_tokens')
    .select('revoked, expires_at')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !data) {
    return false
  }

  if (data.revoked) {
    return false
  }

  const now = new Date()
  const expiresAt = new Date(data.expires_at)
  if (expiresAt < now) {
    return false
  }

  return true
}

/**
 * Helper: Revoke refresh token (on logout)
 */
export async function revokeRefreshToken(tokenHash: string) {
  const { error } = await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked: true, updated_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)

  if (error) {
    console.error('Error revoking refresh token:', error)
    throw error
  }
}

/**
 * Helper: Revoke all refresh tokens for a user (security measure)
 */
export async function revokeAllUserTokens(userId: string) {
  const { error } = await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) {
    console.error('Error revoking all user tokens:', error)
    throw error
  }
}