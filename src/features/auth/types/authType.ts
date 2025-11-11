// /types/auth.ts
export interface LoginFormValues {
  email: string;
  password: string;
}

// export interface UserProfile {
//   id: string;
//   email: string;
//   full_name?: string;
//   phone_number?: string;
//   address?: string;
//   postal_code?: string;
//   birthday?: string;
//   profile_completed?: boolean;
//   role?: string;
// }

// export interface LoginResponse {
//   user: UserProfile;
//   profile_completed: boolean;
// }

//! new version

// src/features/auth/types/auth.types.ts

/**
 * User Role Types
 * Only customer and admin roles
 */
export type UserRole = 'customer' | 'admin'

/**
 * User Profile
 * Complete user information from database
 */
export interface UserProfile {
  id: string
  phoneNumber: string | null
  email: string | null
  fullName: string | null
  role: UserRole
  profileCompleted: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Auth User
 * Minimal user data for authenticated session
 */
export interface AuthUser {
  id: string
  phoneNumber?: string | null
  email?: string | null
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
  fullName?: string
  phoneNumber?: string
  provider: 'google'
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
 */
export interface SessionData {
  userId: string
  phoneNumber?: string | null
  email?: string | null
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
}

// ==================== API RESPONSE TYPES ====================

/**
 * Generic API Success Response
 */
export interface APISuccessResponse<T = any> {
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
  code?: number
  details?: any
}

/**
 * API Response (Union Type)
 */
export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse

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

// ==================== CART MERGE TYPES ====================

/**
 * Cart Merge Data
 * Used when merging guest cart to authenticated user
 */
export interface CartMergeData {
  guestCartItems: any[] // Replace 'any' with your cart item type
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
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard for UserProfile
 */
export function isUserProfile(user: any): user is UserProfile {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.profileCompleted === 'boolean' &&
    typeof user.role === 'string'
  )
}

/**
 * Type guard for AuthUser
 */
export function isAuthUser(user: any): user is AuthUser {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.role === 'string'
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
