# ✅ Error System Integration Checklist

## Phase 1: Core Files ✅ (COMPLETED)

- [x] `src/shared/utils/errors.ts` - Enhanced with AppError class
- [x] `src/shared/utils/response.ts` - Integrated with error system
- [x] `src/shared/lib/jwt/verify.ts` - Updated to throw AppError
- [x] `src/shared/lib/jwt/sign.ts` - Already good (no changes needed)
- [x] `src/shared/lib/jwt/types.ts` - Already good (no changes needed)

---

## Phase 2: Update Existing Files 🔄

### Kavenegar Client (`src/shared/lib/kavenegar/client.ts`)

**Current issues:**
- Uses generic `Error` and `reject()`
- No standardized error handling

**Changes needed:**
```typescript
// Add imports at top
import { createExternalAPIError, logError } from '@/shared/utils/errors'

// In sendSMS function, replace reject() with:
throw createExternalAPIError(
  `خطا در ارسال پیامک: وضعیت ${status}`,
  { response, status }
)

// In sendOTPSMS, wrap in try-catch:
try {
  return await sendSMS({ ... })
} catch (error) {
  logError(error, 'Kavenegar - Send OTP SMS')
  throw error
}
```

**Action items:**
- [ ] Add error imports
- [ ] Replace `reject()` with `throw createExternalAPIError()`
- [ ] Add try-catch with logging
- [ ] Test SMS sending with error scenarios

---

### Supabase Server Client (`src/shared/lib/supabase/server.ts`)

**Current issues:**
- Uses `console.error` and generic `throw error`
- No AppError wrapping

**Changes needed:**
```typescript
// Add imports
import { createDatabaseError, logError } from '@/shared/utils/errors'

// In createUserRecord, replace console.error + throw with:
if (error) {
  logError(error, 'Supabase - Create User Record')
  throw createDatabaseError('خطا در ایجاد کاربر', { error: error.message })
}

// Apply same pattern to all helper functions
```

**Action items:**
- [ ] Add error imports to server.ts
- [ ] Replace all `console.error` with `logError()`
- [ ] Wrap database errors in `createDatabaseError()`
- [ ] Test all helper functions with error scenarios

---

### Cookies Utility (`src/shared/utils/cookies.ts`)

**Current status:** ✅ Good - No changes needed

This file only handles cookie operations, doesn't throw errors.

---

## Phase 3: Create API Routes 🚀

### Send OTP Route (`src/app/api/auth/send-otp/route.ts`)

**Required:**
- [x] Input validation with Zod
- [x] Rate limiting check
- [x] Error handling with `handleAPIRouteError`
- [x] Use `createValidationError`, `createRateLimitError`
- [x] Use `successResponse`

**Action items:**
- [ ] Create file structure: `src/app/api/auth/send-otp/route.ts`
- [ ] Copy example from artifacts
- [ ] Update Zod schema for your needs
- [ ] Implement rate limiting (use Redis in production)
- [ ] Test with invalid inputs
- [ ] Test with rate limit exceeded
- [ ] Test SMS sending failures

---

### Verify OTP Route (`src/app/api/auth/verify-otp/route.ts`)

**Required:**
- [x] Input validation
- [x] OTP verification logic
- [x] JWT token generation
- [x] Cookie setting
- [x] User creation/retrieval
- [x] Error handling

**Action items:**
- [ ] Create file structure: `src/app/api/auth/verify-otp/route.ts`
- [ ] Implement OTP validation with database
- [ ] Use `createOTPExpiredError`, `createOTPInvalidError`, `createOTPMaxAttemptsError`
- [ ] Generate JWT tokens with `generateTokenPair`
- [ ] Set cookies with `setAuthTokens`
- [ ] Return user data with `successResponse`
- [ ] Test with expired OTP
- [ ] Test with invalid OTP
- [ ] Test with max attempts exceeded

---

### Refresh Token Route (`src/app/api/auth/refresh-token/route.ts`)

**Required:**
- [ ] Get refresh token from cookie
- [ ] Verify refresh token
- [ ] Check if token is revoked in database
- [ ] Generate new access token
- [ ] Optionally rotate refresh token
- [ ] Set new cookies

**Action items:**
- [ ] Create file structure: `src/app/api/auth/refresh-token/route.ts`
- [ ] Use `getRefreshTokenFromCookie()`
- [ ] Use `verifyRefreshToken()` (already throws AppError)
- [ ] Check token validity with `isRefreshTokenValid()`
- [ ] Generate new tokens
- [ ] Update cookies
- [ ] Test with expired token
- [ ] Test with revoked token

**Example skeleton:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshTokenFromCookie()
    
    if (!refreshToken) {
      throw createMissingTokenError('توکن تازه‌سازی یافت نشد')
    }
    
    const payload = await verifyRefreshToken(refreshToken)
    
    // Check if revoked
    const isValid = await isRefreshTokenValid(payload.jti)
    if (!isValid) {
      throw createRefreshTokenError(
        ErrorCode.REFRESH_TOKEN_REVOKED,
        'توکن باطل شده است'
      )
    }
    
    // Generate new access token
    const accessToken = await signAccessToken({
      userId: payload.userId,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      role: payload.role,
    })
    
    await setAccessTokenCookie(accessToken)
    
    return successResponse({ success: true })
  } catch (error) {
    return handleAPIRouteError(error, 'Refresh Token')
  }
}
```

---

### Logout Route (`src/app/api/auth/logout/route.ts`)

**Required:**
- [ ] Get refresh token
- [ ] Revoke token in database
- [ ] Clear cookies
- [ ] Return success

**Action items:**
- [ ] Create file structure: `src/app/api/auth/logout/route.ts`
- [ ] Get token with `getRefreshTokenFromCookie()`
- [ ] Revoke with `revokeRefreshToken()`
- [ ] Clear cookies with `clearAuthCookies()`
- [ ] Return `successResponse()`
- [ ] Test logout flow

**Example:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshTokenFromCookie()
    
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken)
      await revokeRefreshToken(payload.jti)
    }
    
    await clearAuthCookies()
    
    return successResponse({ success: true }, 'خروج موفق')
  } catch (error) {
    return handleAPIRouteError(error, 'Logout')
  }
}
```

---

### Google OAuth Callback (`src/app/(auth)/callback/route.ts`)

**Required:**
- [ ] Exchange OAuth code for session
- [ ] Get user from Supabase Auth
- [ ] Create/update user in your database
- [ ] Generate JWT tokens
- [ ] Set cookies
- [ ] Redirect to profile/dashboard

**Action items:**
- [ ] Create file structure: `src/app/(auth)/callback/route.ts`
- [ ] Handle OAuth exchange
- [ ] Use `getUserByEmail()` or `createUserRecord()`
- [ ] Generate tokens with `generateTokenPair()`
- [ ] Set cookies with `setAuthTokens()`
- [ ] Use `redirectResponse()` for redirect
- [ ] Test OAuth flow end-to-end

---

## Phase 4: Frontend Integration 🎨

### Auth Store (`src/features/auth/store/authStore.ts`)

**Changes needed:**
- [ ] Integrate error handling
- [ ] Add error state if needed
- [ ] Clear tokens properly on logout

---

### Auth Hooks

#### `useOTPLogin` hook

**Action items:**
- [ ] Create `src/features/auth/hooks/useOTPLogin.ts`
- [ ] Use React Query mutations
- [ ] Add `onError` with `showErrorToast`
- [ ] Add `onSuccess` with `showSuccessToast`
- [ ] Update auth store on success
- [ ] Test error scenarios

**Example:**
```typescript
const sendOTPMutation = useMutation({
  mutationFn: async (phoneNumber: string) => {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data
  },
  onSuccess: () => {
    showSuccessToast('کد تایید ارسال شد')
  },
  onError: (error) => {
    showErrorToast(error)
  },
})
```

---

#### `useAuth` hook

**Action items:**
- [ ] Create `src/features/auth/hooks/useAuth.ts`
- [ ] Expose current user from store
- [ ] Provide logout function
- [ ] Handle token refresh logic
- [ ] Add error handling

---

### Components

#### `OTPLoginForm` component

**Action items:**
- [ ] Create `src/features/auth/components/OTPLoginForm.tsx`
- [ ] Use `useOTPLogin` hook
- [ ] Show loading states
- [ ] Display errors with toasts
- [ ] Add countdown timer for resend
- [ ] Validate phone number format

---

#### `ProtectedRoute` component

**Action items:**
- [ ] Create `src/features/auth/components/ProtectedRoute.tsx`
- [ ] Check auth status from store
- [ ] Redirect to login if not authenticated
- [ ] Show loading spinner
- [ ] Preserve redirect URL

---

## Phase 5: Middleware 🛡️

### Next.js Middleware (`src/app/middleware.ts`)

**Action items:**
- [ ] Create `src/app/middleware.ts`
- [ ] Check access token in cookies
- [ ] Verify token with `verifyAccessToken`
- [ ] Define protected routes
- [ ] Define public routes
- [ ] Handle redirects
- [ ] Test protected route access

**Example:**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAccessTokenFromCookie } from '@/shared/utils/cookies'
import { verifyAccessToken } from '@/shared/lib/jwt/verify'

const protectedRoutes = ['/profile', '/orders', '/checkout']
const authRoutes = ['/login', '/callback']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  try {
    const token = await getAccessTokenFromCookie()
    
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }

    await verifyAccessToken(token)
    return NextResponse.next()
  } catch (error) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Phase 6: Testing 🧪

### API Route Tests

- [ ] Test send-otp with valid phone
- [ ] Test send-otp with invalid phone
- [ ] Test send-otp rate limiting
- [ ] Test verify-otp with valid OTP
- [ ] Test verify-otp with expired OTP
- [ ] Test verify-otp with invalid OTP
- [ ] Test verify-otp with max attempts
- [ ] Test refresh-token with valid token
- [ ] Test refresh-token with expired token
- [ ] Test refresh-token with revoked token
- [ ] Test logout flow

### Frontend Tests

- [ ] Test login form validation
- [ ] Test OTP verification
- [ ] Test error toasts display
- [ ] Test success toasts display
- [ ] Test protected route redirect
- [ ] Test token refresh on expiry

---

## Phase 7: Production Readiness 🚀

### Security Checklist

- [ ] JWT secrets are strong (64+ characters)
- [ ] Secrets stored in environment variables
- [ ] Cookies are httpOnly, secure, sameSite
- [ ] Rate limiting implemented (use Redis)
- [ ] OTP expiry set to 2 minutes
- [ ] Max OTP attempts set to 3
- [ ] Refresh tokens stored as hashes
- [ ] Token revocation on logout working
- [ ] CORS configured properly

### Monitoring & Logging

- [ ] Error logging configured
- [ ] Error monitoring tool integrated (Sentry, etc.)
- [ ] Alert for critical errors
- [ ] Log rotation configured
- [ ] Sensitive data not logged

### Performance

- [ ] Database queries optimized
- [ ] Indexes on phone_number, user_id
- [ ] Old OTP codes cleaned up (cron job)
- [ ] Revoked tokens cleaned up (cron job)
- [ ] Rate limiting using Redis (not Map)

---

## Quick Start Commands

```bash
# 1. Install dependencies (if not already)
npm install zod jose kavenegar react-hot-toast

# 2. Set up environment variables
cp .env.example .env.local
# Fill in: JWT secrets, Supabase keys, Kavenegar API key

# 3. Create API route folders
mkdir -p src/app/api/auth/send-otp
mkdir -p src/app/api/auth/verify-otp
mkdir -p src/app/api/auth/refresh-token
mkdir -p src/app/api/auth/logout

# 4. Create auth feature folders
mkdir -p src/features/auth/components
mkdir -p src/features/auth/hooks
mkdir -p src/features/auth/store

# 5. Run development server
npm run dev
```

---

## Priority Order

1. **High Priority** (Do first):
   - ✅ Update kavenegar/client.ts with error handling
   - ✅ Update supabase/server.ts with error handling
   - ✅ Create send-otp route
   - ✅ Create verify-otp route

2. **Medium Priority** (Do next):
   - Create refresh-token route
   - Create logout route
   - Create OTPLoginForm component
   - Create useOTPLogin hook

3. **Low Priority** (Do last):
   - Create middleware
   - Add Google OAuth callback
   - Create ProtectedRoute component
   - Add comprehensive tests

---

## Need Help?

Stuck on something? Check:
1. Error System Usage Guide (in artifacts)
2. Example API routes (in artifacts)
3. Console logs for error details
4. Network tab for API responses