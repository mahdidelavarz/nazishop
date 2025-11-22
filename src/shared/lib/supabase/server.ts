// src/shared/lib/supabase/server.ts

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from './database.types'
import { DatabaseUser, databaseUserToProfile, UserProfile } from '@/features/auth/types/authType'


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

// ==================== USER MANAGEMENT ====================

/**
 * Create user in public.users table
 * Used after OTP verification or OAuth callback
 * 
 * @param data - User data to create
 * @returns Promise resolving to created user profile
 * @throws Error if creation fails
 */
export async function createUserRecord(data: {
  id: string
  phoneNumber?: string | null
  email?: string | null
  fullName?: string | null
  role?: 'customer' | 'admin'
}): Promise<UserProfile> {
  const insertData: TablesInsert<'users'> = {
    id: data.id,
    phone_number: data.phoneNumber || null,
    email: data.email || null,
    full_name: data.fullName || null,
    role: data.role || 'customer',
    profile_completed: !!data.fullName,
    created_at: new Date().toISOString(),
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user record:', error)
    throw new Error(`Failed to create user: ${error.message}`)
  }

  if (!user) {
    throw new Error('User created but no data returned')
  }

  return databaseUserToProfile(user as DatabaseUser)
}

/**
 * Get user by phone number
 * 
 * @param phoneNumber - Phone number to search (98XXXXXXXXXX format)
 * @returns Promise resolving to user profile or null
 */
export async function getUserByPhone(phoneNumber: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single()

  if (error) {
    // PGRST116 = not found, which is ok
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user by phone:', error)
    throw new Error(`Failed to fetch user by phone: ${error.message}`)
  }

  return data ? databaseUserToProfile(data as DatabaseUser) : null
}

/**
 * Get user by email
 * 
 * @param email - Email to search
 * @returns Promise resolving to user profile or null
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    // PGRST116 = not found, which is ok
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user by email:', error)
    throw new Error(`Failed to fetch user by email: ${error.message}`)
  }

  return data ? databaseUserToProfile(data as DatabaseUser) : null
}

/**
 * Get user by ID
 * 
 * @param userId - User ID to fetch
 * @returns Promise resolving to user profile
 * @throws Error if user not found or fetch fails
 */
export async function getUserById(userId: string): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user by ID:', error)
    throw new Error(`Failed to fetch user by ID: ${error.message}`)
  }

  if (!data) {
    throw new Error(`User not found: ${userId}`)
  }

  return databaseUserToProfile(data as DatabaseUser)
}

/**
 * Update user profile
 * 
 * @param userId - User ID to update
 * @param updates - Fields to update
 * @returns Promise resolving to updated user profile
 * @throws Error if update fails
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    fullName?: string
    profileCompleted?: boolean
    email?: string
    phoneNumber?: string
    address?: string
    postalCode?: string
    birthday?: string
  }
): Promise<UserProfile> {
  const updateData: TablesUpdate<'users'> = {}

  if (updates.fullName !== undefined) updateData.full_name = updates.fullName
  if (updates.profileCompleted !== undefined) updateData.profile_completed = updates.profileCompleted
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber
  if (updates.address !== undefined) updateData.address = updates.address
  if (updates.postalCode !== undefined) updateData.postal_code = updates.postalCode
  if (updates.birthday !== undefined) updateData.birthday = updates.birthday

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  if (!data) {
    throw new Error('User updated but no data returned')
  }

  return databaseUserToProfile(data as DatabaseUser)
}

/**
 * Delete user (soft delete - could mark as deleted instead)
 * 
 * @param userId - User ID to delete
 * @returns Promise resolving to success status
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('Error deleting user:', error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  return true
}

// ==================== REFRESH TOKEN MANAGEMENT ====================

/**
 * Store refresh token in database
 * 
 * @param data - Refresh token data
 * @returns Promise resolving to token ID
 */
export async function storeRefreshToken(data: {
  userId: string
  tokenHash: string
  jti: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}): Promise<string> {
  const { data: token, error } = await supabaseAdmin
    .from('refresh_tokens')
    .insert({
      user_id: data.userId,
      token_hash: data.tokenHash,
      expires_at: data.expiresAt.toISOString(),
      revoked: false,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error storing refresh token:', error)
    throw new Error(`Failed to store refresh token: ${error.message}`)
  }

  return token.id
}

/**
 * Check if refresh token is valid (not revoked, not expired)
 * 
 * @param tokenHash - Hashed token to check
 * @returns Promise resolving to validity status
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
 * Get refresh token by JTI
 * 
 * @param jti - JWT ID to search
 * @returns Promise resolving to token data or null
 */
export async function getRefreshTokenByJTI(jti: string) {
  const { data, error } = await supabaseAdmin
    .from('refresh_tokens')
    .select('*')
    .eq('token_hash', jti)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching refresh token:', error)
    return null
  }

  return data
}

/**
 * Revoke refresh token (on logout)
 * 
 * @param tokenHash - Hashed token to revoke
 * @returns Promise resolving to success status
 */
export async function revokeRefreshToken(tokenHash: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('token_hash', tokenHash)

  if (error) {
    console.error('Error revoking refresh token:', error)
    return false
  }

  return true
}

/**
 * Revoke all refresh tokens for a user (security measure)
 * 
 * @param userId - User ID whose tokens to revoke
 * @returns Promise resolving to success status
 */
export async function revokeAllUserTokens(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('user_id', userId)
    .eq('revoked', false)

  if (error) {
    console.error('Error revoking all user tokens:', error)
    return false
  }

  return true
}

/**
 * Clean up expired refresh tokens
 * Should be run periodically (e.g., via cron job)
 * 
 * @returns Promise resolving to number of deleted tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('refresh_tokens')
    .delete()
    .lt('expires_at', now)
    .select('id')

  if (error) {
    console.error('Error cleaning up expired tokens:', error)
    return 0
  }

  return data?.length || 0
}

// ==================== OTP CODE MANAGEMENT ====================

/**
 * Store OTP code in database
 * 
 * @param data - OTP code data
 * @returns Promise resolving to OTP ID
 */
export async function storeOTPCode(data: {
  phoneNumber: string
  otpCode: string
  expiresAt: Date
}): Promise<string> {
  const { data: otp, error } = await supabaseAdmin
    .from('otp_codes')
    .insert({
      phone_number: data.phoneNumber,
      otp_code: data.otpCode,
      expires_at: data.expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      verified: false,
      attempts: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error storing OTP code:', error)
    throw new Error(`Failed to store OTP code: ${error.message}`)
  }

  return otp.id
}

/**
 * Get latest OTP code for phone number
 * 
 * @param phoneNumber - Phone number to search
 * @returns Promise resolving to OTP data or null
 */
export async function getLatestOTPCode(phoneNumber: string) {
  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching latest OTP:', error)
    return null
  }

  return data
}

/**
 * Verify OTP code
 * 
 * @param phoneNumber - Phone number
 * @param otpCode - OTP code to verify
 * @returns Promise resolving to verification status
 */
export async function verifyOTPCode(
  phoneNumber: string,
  otpCode: string
): Promise<{ valid: boolean; expired?: boolean; tooManyAttempts?: boolean }> {
  const otp = await getLatestOTPCode(phoneNumber)

  if (!otp) {
    return { valid: false }
  }

  // Check if expired
  const now = new Date()
  const expiresAt = new Date(otp.expires_at)
  if (expiresAt < now) {
    return { valid: false, expired: true }
  }

  // Check attempts
  if (otp.attempts >= 5) {
    return { valid: false, tooManyAttempts: true }
  }

  // Increment attempts
  await supabaseAdmin
    .from('otp_codes')
    .update({ attempts: otp.attempts + 1 })
    .eq('id', otp.id)

  // Check if code matches
  if (otp.otp_code !== otpCode) {
    return { valid: false }
  }

  // Mark as verified
  await supabaseAdmin
    .from('otp_codes')
    .update({ verified: true })
    .eq('id', otp.id)

  return { valid: true }
}

/**
 * Clean up old OTP codes
 * Should be run periodically
 * 
 * @returns Promise resolving to number of deleted codes
 */
export async function cleanupOldOTPCodes(): Promise<number> {
  const twentyFourHoursAgo = new Date()
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .delete()
    .lt('created_at', twentyFourHoursAgo.toISOString())
    .select('id')

  if (error) {
    console.error('Error cleaning up old OTP codes:', error)
    return 0
  }

  return data?.length || 0
}

// ==================== LOGIN LOG ====================

/**
 * Create login log entry
 * 
 * @param data - Login log data
 * @returns Promise resolving to log ID
 */
export async function createLoginLog(data: {
  userId: string
  ipAddress?: string
  userAgent?: string
}): Promise<string> {
  const { data: log, error } = await supabaseAdmin
    .from('loginlog')
    .insert({
      user_id: data.userId,
      login_at: new Date().toISOString(),
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating login log:', error)
    throw new Error(`Failed to create login log: ${error.message}`)
  }

  return log.id
}

/**
 * Get user login history
 * 
 * @param userId - User ID
 * @param limit - Number of entries to return
 * @returns Promise resolving to login history array
 */
export async function getUserLoginHistory(userId: string, limit: number = 10) {
  const { data, error } = await supabaseAdmin
    .from('loginlog')
    .select('*')
    .eq('user_id', userId)
    .order('login_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching login history:', error)
    return []
  }

  return data || []
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check database connection
 * 
 * @returns Promise resolving to connection status
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    return false
  }
}

/**
 * Execute in transaction (helper for multiple operations)
 * Note: Supabase doesn't have native transactions in JS client,
 * so this is a best-effort approach
 * 
 * @param operations - Array of async operations to execute
 * @returns Promise resolving when all operations complete
 */
export async function executeInTransaction<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  try {
    return await Promise.all(operations.map(op => op()))
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}