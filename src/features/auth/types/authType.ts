// src/features/auth/types/auth.types.ts

/**
 * User Role Types
 * Only customer and admin roles
 */
export type UserRole = 'customer' | 'admin'

/**
 * Authentication Provider
 */
export type AuthProvider = 'otp' | 'google'

/**
 * User Profile
 * Complete user information from database (maps to Supabase users table)
 */
export interface UserProfile {
  id: string
  phoneNumber: string | null
  email: string | null
  fullName: string | null
  address: string | null
  postalCode: string | null
  birthday: string | null
  role: UserRole
  profileCompleted: boolean
}

/**
 * Database User Row (snake_case from Supabase)
 * Used for type-safe database operations
 */
export interface DatabaseUser {
  id: string
  phone_number: string | null
  email: string | null
  full_name: string | null
  address: string | null
  postal_code: string | null
  birthday: string | null
  role: UserRole
  profile_completed: boolean
}

/**
 * Auth User
 * Minimal user data for authenticated session (stored in JWT)
 */
export interface AuthUser {
  id: string
  phoneNumber: string | null
  email: string | null
  role: UserRole
}

/**
 * Auth State
 * Current authentication state in the app
 */
export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  lastTokenRefresh: number | null
}

// ==================== OTP TYPES ====================

/**
 * Send OTP Request
 */
export interface SendOTPRequest {
  phoneNumber: string
}

/**
 * Send OTP Response
 */
export interface SendOTPResponse {
  success: boolean
  message: string
  expiresIn: number // seconds
  debug?: {
    otpCode: string // Only in development
  }
}

/**
 * Verify OTP Request
 */
export interface VerifyOTPRequest {
  phoneNumber: string
  otpCode: string
}

/**
 * Verify OTP Response
 */
export interface VerifyOTPResponse {
  success: boolean
  message: string
  userId: string
  phoneNumber: string
  isNewUser: boolean
  profileCompleted: boolean
  accessToken: string
  refreshToken: string
  role: UserRole // Fixed: Now uses UserRole type
}

// ==================== GOOGLE OAUTH TYPES ====================

/**
 * Google OAuth Callback Data
 */
export interface GoogleOAuthCallbackData {
  code: string
  redirectedFrom?: string
}

/**
 * OAuth User Data from Supabase
 */
export interface OAuthUserData {
  id: string
  email: string
  fullName?: string | null
  phoneNumber?: string | null
  provider: AuthProvider
}

/**
 * Google Login Response
 */
export interface GoogleLoginResponse {
  success: boolean
  message: string
  userId: string
  email: string
  isNewUser: boolean
  profileCompleted: boolean
  accessToken: string
  refreshToken: string
  role: UserRole
}

// ==================== LOGIN/REGISTER TYPES ====================

/**
 * Login Response (Generic)
 * Used for both OTP and OAuth login
 */
export interface LoginResponse {
  success: boolean
  user: AuthUser
  profileCompleted: boolean
  isNewUser: boolean
  accessToken: string
  refreshToken: string
}

/**
 * Profile Completion Request
 */
export interface ProfileCompletionRequest {
  fullName: string
  email?: string
  address?: string
  postalCode?: string
  birthday?: string
}

/**
 * Profile Completion Response
 */
export interface ProfileCompletionResponse {
  success: boolean
  message: string
  user: UserProfile
}

// ==================== TOKEN TYPES ====================

/**
 * JWT Payload
 * Data encoded in access token
 */
export interface JWTPayload {
  userId: string
  phoneNumber: string | null
  email: string | null
  role: UserRole
  iat: number
  exp: number
}

/**
 * Refresh Token Data (stored in database)
 */
export interface RefreshTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  createdAt: string
  revoked: boolean
}

/**
 * Token Refresh Request
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Token Refresh Response
 */
export interface RefreshTokenResponse {
  success: boolean
  accessToken: string
  refreshToken?: string // Optional: if rotating refresh tokens
  expiresIn: number
}

/**
 * Logout Request
 */
export interface LogoutRequest {
  refreshToken?: string
}

/**
 * Logout Response
 */
export interface LogoutResponse {
  success: boolean
  message: string
}

// ==================== SESSION TYPES ====================

/**
 * Session Data
 * Data stored in JWT and retrieved on verification
 * @deprecated Use JWTPayload instead
 */
export interface SessionData {
  userId: string
  phoneNumber: string | null
  email: string | null
  role: UserRole
  iat: number
  exp: number
}

/**
 * Client Session Info
 * Session info available on client-side
 */
export interface ClientSessionInfo {
  isAuthenticated: boolean
  user: AuthUser | null
  accessTokenExpiry: number | null
  needsRefresh: boolean
}

// ==================== FORM TYPES ====================

/**
 * OTP Login Form Values
 */
export interface OTPLoginFormValues {
  phoneNumber: string
  otpCode?: string
}

/**
 * Profile Form Values
 */
export interface ProfileFormValues {
  fullName: string
  email?: string
  phoneNumber?: string
  address?: string
  postalCode?: string
  birthday?: string
}

// ==================== API RESPONSE TYPES ====================

/**
 * Generic API Success Response
 */
export interface APISuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

/**
 * Generic API Error Response
 */
export interface APIErrorResponse {
  success: false
  error: string
  code?: string // Changed from number to string for better error codes
  details?: unknown
}

/**
 * API Response (Union Type)
 */
export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse

// ==================== VALIDATION TYPES ====================

/**
 * Phone Number Validation Result
 */
export interface PhoneValidationResult {
  isValid: boolean
  formatted?: string // 09XXXXXXXXX format
  international?: string // 989XXXXXXXXX format
  error?: string
}

/**
 * Email Validation Result
 */
export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

/**
 * OTP Code Validation Result
 */
export interface OTPValidationResult {
  isValid: boolean
  error?: string
}

// ==================== RATE LIMITING TYPES ====================

/**
 * Rate Limit Info
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: number // Unix timestamp
}

/**
 * Rate Limit Error
 */
export interface RateLimitError extends APIErrorResponse {
  code: 'RATE_LIMIT_EXCEEDED'
  rateLimitInfo: RateLimitInfo
}

// ==================== CART MERGE TYPES ====================

/**
 * Cart Item (basic structure)
 */
export interface CartItem {
  productId: string
  quantity: number
}

/**
 * Cart Merge Data
 * Used when merging guest cart to authenticated user
 */
export interface CartMergeData {
  guestCartItems: CartItem[]
  userId: string
}

/**
 * Cart Merge Response
 */
export interface CartMergeResponse {
  success: boolean
  mergedCount: number
  message: string
}

// ==================== UTILITY TYPES ====================

/**
 * Auth Action Types (for logging/analytics)
 */
export type AuthAction =
  | 'send_otp'
  | 'verify_otp'
  | 'google_login'
  | 'refresh_token'
  | 'logout'
  | 'profile_complete'

/**
 * Auth Error Context
 */
export interface AuthErrorContext {
  action: AuthAction
  userId?: string
  phoneNumber?: string
  email?: string
  timestamp: number
  error: string
}

/**
 * Login Log Entry
 */
export interface LoginLogEntry {
  id: string
  userId: string
  loginAt: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard for UserProfile
 */
export function isUserProfile(user: unknown): user is UserProfile {
  if (!user || typeof user !== 'object') return false
  
  const u = user as Record<string, unknown>
  
  return (
    typeof u.id === 'string' &&
    (typeof u.phoneNumber === 'string' || u.phoneNumber === null) &&
    (typeof u.email === 'string' || u.email === null) &&
    (typeof u.fullName === 'string' || u.fullName === null) &&
    typeof u.profileCompleted === 'boolean' &&
    (u.role === 'customer' || u.role === 'admin')
  )
}

/**
 * Type guard for AuthUser
 */
export function isAuthUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== 'object') return false
  
  const u = user as Record<string, unknown>
  
  return (
    typeof u.id === 'string' &&
    (typeof u.phoneNumber === 'string' || u.phoneNumber === null) &&
    (typeof u.email === 'string' || u.email === null) &&
    (u.role === 'customer' || u.role === 'admin')
  )
}

/**
 * Type guard for API Success Response
 */
export function isAPISuccess<T>(
  response: APIResponse<T>
): response is APISuccessResponse<T> {
  return response.success === true
}

/**
 * Type guard for API Error Response
 */
export function isAPIError(
  response: APIResponse
): response is APIErrorResponse {
  return response.success === false
}

/**
 * Type guard for Rate Limit Error
 */
export function isRateLimitError(
  response: APIResponse
): response is RateLimitError {
  return (
    response.success === false &&
    'code' in response &&
    response.code === 'RATE_LIMIT_EXCEEDED'
  )
}

/**
 * Type guard for JWTPayload
 */
export function isJWTPayload(payload: unknown): payload is JWTPayload {
  if (!payload || typeof payload !== 'object') return false
  
  const p = payload as Record<string, unknown>
  
  return (
    typeof p.userId === 'string' &&
    (typeof p.phoneNumber === 'string' || p.phoneNumber === null) &&
    (typeof p.email === 'string' || p.email === null) &&
    (p.role === 'customer' || p.role === 'admin') &&
    typeof p.iat === 'number' &&
    typeof p.exp === 'number'
  )
}

// ==================== HELPER UTILITIES ====================

/**
 * Convert DatabaseUser (snake_case) to UserProfile (camelCase)
 */
export function databaseUserToProfile(dbUser: DatabaseUser): UserProfile {
  return {
    id: dbUser.id,
    phoneNumber: dbUser.phone_number,
    email: dbUser.email,
    fullName: dbUser.full_name,
    address: dbUser.address,
    postalCode: dbUser.postal_code,
    birthday: dbUser.birthday,
    role: dbUser.role,
    profileCompleted: dbUser.profile_completed,
  }
}

/**
 * Convert UserProfile (camelCase) to DatabaseUser (snake_case)
 */
export function profileToDatabaseUser(profile: UserProfile): DatabaseUser {
  return {
    id: profile.id,
    phone_number: profile.phoneNumber,
    email: profile.email,
    full_name: profile.fullName,
    address: profile.address,
    postal_code: profile.postalCode,
    birthday: profile.birthday,
    role: profile.role,
    profile_completed: profile.profileCompleted,
  }
}