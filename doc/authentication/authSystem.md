# 🔐 Complete Authentication System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Authentication Flow](#authentication-flow)
4. [Token Management](#token-management)
5. [Security Model](#security-model)
6. [Component Breakdown](#component-breakdown)
7. [Environment Variables](#environment-variables)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Client-Side Implementation](#client-side-implementation)
11. [Server-Side Implementation](#server-side-implementation)
12. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is This Authentication System?

This is a **hybrid authentication system** that supports two login methods:
1. **OTP (One-Time Password)** via SMS using Kavenegar
2. **Google OAuth** using Supabase Auth

The system uses **JWT (JSON Web Tokens)** with a **refresh token rotation** strategy for session management, providing enterprise-grade security while maintaining a seamless user experience.

### Key Features
- ✅ Passwordless authentication (OTP + OAuth)
- ✅ JWT-based session management
- ✅ Refresh token rotation
- ✅ Role-based access control (Customer/Admin)
- ✅ Automatic token refresh
- ✅ Server-side and client-side route protection
- ✅ Rate limiting on OTP requests
- ✅ Cart merging on login
- ✅ Profile completion flow

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Login Form   │  │  UserMenu    │  │ Protected    │          │
│  │ (OTP/OAuth)  │  │  Component   │  │ Routes       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                 │
│         └─────────────────┴──────────────────┘                 │
│                           │                                    │
│                    ┌──────▼──────┐                             │
│                    │ Auth Hooks  │                             │
│                    │ useAuth()   │                             │
│                    │ useOTPLogin │                             │
│                    └──────┬──────┘                             │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │ Auth Store  │                              │
│                    │  (Zustand)  │                              │
│                    └──────┬──────┘                              │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │  Cookies    │                              │
│                    │ access_token│                              │
│                    │refresh_token│                              │
│                    └─────────────┘                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   HTTP REQUEST │
                    └───────┬────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    NEXT.JS MIDDLEWARE                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Extract access_token from cookies                     │  │
│  │ 2. Verify JWT signature & expiry                         │  │
│  │ 3. Check user role for admin routes                      │  │
│  │ 4. Allow/Deny access or redirect to /login              │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        NEXT.JS API ROUTES                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ /api/auth/      │  │ /api/auth/      │  │ /api/auth/     │  │
│  │ send-otp        │  │ verify-otp      │  │ refresh-token  │  │
│  │                 │  │                 │  │                │  │
│  │ 1. Validate     │  │ 1. Verify OTP   │  │ 1. Verify      │  │
│  │ 2. Generate OTP │  │ 2. Create user  │  │    refresh     │  │
│  │ 3. Save to DB   │  │ 3. Gen tokens   │  │    token       │  │
│  │ 4. Send SMS     │  │ 4. Store tokens │  │ 2. Gen new     │  │
│  │                 │  │ 5. Set cookies  │  │    access      │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬───────┘  │
│           │                    │                     │           │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼───────┐  │
│  │  /api/auth/     │  │   /callback     │  │  /api/auth/    │  │
│  │  logout         │  │  (OAuth)        │  │  [other]       │  │
│  │                 │  │                 │  │                │  │
│  │ 1. Get token    │  │ 1. Exchange     │  │                │  │
│  │ 2. Revoke in DB │  │    OAuth code   │  │                │  │
│  │ 3. Clear cookies│  │ 2. Create user  │  │                │  │
│  │                 │  │ 3. Gen tokens   │  │                │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────────┘  │
└───────────┼───────────────────┼─────────────────────────────────┘
            │                   │
┌───────────▼───────────────────▼─────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │   Supabase      │  │   Kavenegar     │  │   JWT Library  │  │
│  │   Database      │  │   SMS Gateway   │  │   (jose)       │  │
│  │                 │  │                 │  │                │  │
│  │ - users         │  │ - Send OTP SMS  │  │ - Sign tokens  │  │
│  │ - otp_codes     │  │ - Check status  │  │ - Verify tokens│  │
│  │ - refresh_tokens│  │                 │  │                │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### 1. OTP Login Flow (Detailed)

```
┌────────────┐
│   USER     │
└─────┬──────┘
      │
      │ 1. Enter phone number (09XXXXXXXXX)
      │
      ▼
┌─────────────────────────────────────────┐
│  OTPLoginForm Component (Client)         │
│  ├─ Validate phone format                │
│  └─ Call useSendOTP.mutate(phoneNumber)  │
└─────────────┬───────────────────────────┘
              │
              │ POST /api/auth/send-otp
              │ Body: { phoneNumber }
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  /api/auth/send-otp Route (Server)                   │
│  ├─ 1. Validate phone format (09XXXXXXXXX)           │
│  ├─ 2. Check rate limit (max 3 per hour)             │
│  ├─ 3. Generate 6-digit OTP (Math.random)            │
│  ├─ 4. Delete old OTPs for this phone                │
│  ├─ 5. Save new OTP to database                      │
│  │     Table: otp_codes                              │
│  │     Fields: phone_number, otp_code, expires_at    │
│  │             (2 min expiry), verified=false        │
│  ├─ 6. Convert phone to Kavenegar format             │
│  │     09123456789 → 989123456789                    │
│  ├─ 7. Send SMS via Kavenegar.Send()                 │
│  └─ 8. Return success (+ OTP in dev mode)            │
└─────────────┬────────────────────────────────────────┘
              │
              │ Response: { success, expiresIn, debug }
              │
              ▼
┌─────────────────────────────────────────┐
│  OTPLoginForm Component (Client)         │
│  ├─ Show success toast                   │
│  ├─ Display OTP in dev mode              │
│  ├─ Start 2-minute countdown             │
│  └─ Switch to OTP input step             │
└─────────────┬───────────────────────────┘
              │
              │ User receives SMS: "کد تایید شما: 123456"
              │
              ▼
┌─────────────────────────────────────────┐
│   USER                                   │
│   Enter 6-digit OTP code                 │
└─────────────┬───────────────────────────┘
              │
              │ 2. Enter OTP code
              │
              ▼
┌─────────────────────────────────────────┐
│  OTPLoginForm Component (Client)         │
│  ├─ Validate OTP format (6 digits)       │
│  └─ Call useVerifyOTP.mutate()           │
│      { phoneNumber, otpCode }            │
└─────────────┬───────────────────────────┘
              │
              │ POST /api/auth/verify-otp
              │ Body: { phoneNumber, otpCode }
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  /api/auth/verify-otp Route (Server)                 │
│  ├─ 1. Find OTP in database                          │
│  │     WHERE phone = ? AND code = ?                  │
│  │     AND verified = false AND expires_at > now     │
│  ├─ 2. Check attempts < 3                            │
│  ├─ 3. Mark OTP as verified                          │
│  ├─ 4. Check if user exists in users table           │
│  │     SELECT * WHERE phone_number = ?               │
│  ├─ 5a. If user exists:                              │
│  │     └─ Get userId, profileCompleted, role         │
│  ├─ 5b. If new user:                                 │
│  │     └─ Generate UUID                              │
│  │     └─ INSERT INTO users                          │
│  │         (id, phone_number, role='customer',       │
│  │          profile_completed=false)                 │
│  ├─ 6. Generate JWT token pair:                      │
│  │     ┌─────────────────────────────┐               │
│  │     │ Access Token (15 minutes)   │               │
│  │     │ ├─ userId                    │               │
│  │     │ ├─ phoneNumber               │               │
│  │     │ ├─ role                      │               │
│  │     │ ├─ type: 'access'            │               │
│  │     │ └─ exp: now + 15min          │               │
│  │     └─────────────────────────────┘               │
│  │     ┌─────────────────────────────┐               │
│  │     │ Refresh Token (7 days)      │               │
│  │     │ ├─ userId                    │               │
│  │     │ ├─ phoneNumber               │               │
│  │     │ ├─ role                      │               │
│  │     │ ├─ type: 'refresh'           │               │
│  │     │ ├─ jti: randomUUID()         │               │
│  │     │ └─ exp: now + 7days          │               │
│  │     └─────────────────────────────┘               │
│  ├─ 7. Hash refresh token (SHA-256)                  │
│  ├─ 8. Store refresh token hash in database          │
│  │     Table: refresh_tokens                         │
│  │     Fields: user_id, token_hash, expires_at       │
│  ├─ 9. Set httpOnly cookies:                         │
│  │     ├─ access_token (maxAge: 15min)               │
│  │     └─ refresh_token (maxAge: 7days)              │
│  │     Options: httpOnly, secure, sameSite=lax       │
│  └─ 10. Return user data                             │
└─────────────┬────────────────────────────────────────┘
              │
              │ Response: { userId, phoneNumber, 
              │             isNewUser, profileCompleted }
              │
              ▼
┌─────────────────────────────────────────┐
│  useVerifyOTP Hook (Client)              │
│  ├─ Store user in Zustand                │
│  ├─ Store userId in localStorage          │
│  ├─ Merge guest cart to server            │
│  ├─ Show success toast                    │
│  └─ Redirect:                             │
│      ├─ If profileCompleted → /          │
│      └─ If !profileCompleted → /profile  │
└─────────────────────────────────────────┘
```

**Key Points:**
- **Client**: Form validation, UI updates, state management
- **Server**: Business logic, database operations, token generation
- **Cookies**: Tokens stored in httpOnly cookies (not accessible by JavaScript)
- **Database**: Users, OTPs, and refresh tokens stored in Supabase

---

### 2. Google OAuth Flow (Detailed)

```
┌────────────┐
│   USER     │
└─────┬──────┘
      │
      │ 1. Click "Login with Google"
      │
      ▼
┌─────────────────────────────────────────┐
│  OTPLoginForm Component (Client)         │
│  └─ Call useGoogleLogin.mutate()         │
└─────────────┬───────────────────────────┘
              │
              │ Call supabase.auth.signInWithOAuth()
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  Supabase Auth Service                                │
│  ├─ Redirect to Google OAuth consent screen          │
│  └─ RedirectURL: /callback?redirectedFrom=/          │
└─────────────┬────────────────────────────────────────┘
              │
              │ Browser redirects to Google
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  Google OAuth Consent Screen                          │
│  User approves permissions                            │
└─────────────┬────────────────────────────────────────┘
              │
              │ Google redirects back with code
              │ URL: /callback?code=abc123&redirectedFrom=/
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  /callback Route (Server)                             │
│  ├─ 1. Extract code from URL params                   │
│  ├─ 2. Exchange code for session via Supabase        │
│  │     supabase.auth.exchangeCodeForSession(code)    │
│  │     Returns: { user, session }                    │
│  ├─ 3. Extract user data:                            │
│  │     ├─ id (Supabase Auth user ID)                │
│  │     ├─ email                                      │
│  │     ├─ full_name (from user_metadata)            │
│  │     └─ phone (if available)                      │
│  ├─ 4. Check if user exists in our users table       │
│  │     SELECT * WHERE id = ?                         │
│  ├─ 5a. If user exists:                              │
│  │     └─ Get profileCompleted, role                 │
│  ├─ 5b. If new user:                                 │
│  │     └─ INSERT INTO users                          │
│  │         (id, email, full_name, role='customer',   │
│  │          profile_completed=!!full_name)           │
│  ├─ 6. Generate JWT token pair (same as OTP flow)    │
│  ├─ 7. Hash and store refresh token                  │
│  ├─ 8. Set httpOnly cookies                          │
│  └─ 9. Redirect to:                                  │
│      ├─ /profile (if !profileCompleted)             │
│      └─ redirectedFrom (if profileCompleted)         │
└──────────────────────────────────────────────────────┘
```

**Key Differences from OTP:**
- **Supabase handles OAuth flow**: No manual token exchange
- **Email as primary identifier**: Instead of phone number
- **No OTP verification**: Google verifies identity
- **Profile may be pre-filled**: From Google account data

---

## Token Management

### What are Access Token and Refresh Token?

#### Access Token
```javascript
{
  userId: "uuid-here",
  phoneNumber: "09123456789",
  email: "user@example.com",
  role: "customer",
  type: "access",
  iat: 1234567890,  // Issued at
  exp: 1234568790   // Expires in 15 minutes
}
```

**Purpose**: Short-lived token for API authentication
**Lifetime**: 15 minutes
**Storage**: httpOnly cookie (`access_token`)
**Usage**: Sent with every API request, verified by middleware

#### Refresh Token
```javascript
{
  userId: "uuid-here",
  phoneNumber: "09123456789",
  email: "user@example.com",
  role: "customer",
  type: "refresh",
  jti: "unique-token-id",  // JWT ID for revocation
  iat: 1234567890,
  exp: 1235172690  // Expires in 7 days
}
```

**Purpose**: Long-lived token to get new access tokens
**Lifetime**: 7 days
**Storage**: httpOnly cookie (`refresh_token`) + hashed in database
**Usage**: Only used to refresh expired access tokens

---

### Token Lifecycle

```
TIME: 0 minutes
┌──────────────────────────────────────┐
│  User logs in (OTP or OAuth)         │
│  ├─ Access Token generated (15min)   │
│  └─ Refresh Token generated (7days)  │
└─────────────┬────────────────────────┘
              │
              │ Tokens stored in cookies
              │
TIME: 0-14 minutes
┌──────────────────────────────────────┐
│  User makes API requests              │
│  ├─ Access token sent in cookies     │
│  ├─ Middleware verifies token         │
│  └─ Request proceeds                  │
└──────────────────────────────────────┘
              │
TIME: 10 minutes (Background)
┌──────────────────────────────────────┐
│  useAuth Hook Auto-Refresh            │
│  ├─ Detects token expiring soon       │
│  ├─ Calls /api/auth/refresh-token     │
│  └─ Gets new access token             │
└─────────────┬────────────────────────┘
              │
TIME: 15+ minutes (If auto-refresh fails)
┌──────────────────────────────────────┐
│  Access Token Expired                 │
│  ├─ Middleware detects expired token  │
│  ├─ Redirects to /login               │
│  └─ Preserves redirectedFrom URL      │
└──────────────────────────────────────┘
              │
TIME: User returns
┌──────────────────────────────────────┐
│  User tries to access protected route │
│  ├─ Access token expired              │
│  ├─ Refresh token still valid         │
│  ├─ Auto-refresh triggered            │
│  └─ New access token generated        │
└──────────────────────────────────────┘
              │
TIME: 7+ days
┌──────────────────────────────────────┐
│  Refresh Token Expired                │
│  ├─ User must login again             │
│  └─ Full authentication required      │
└──────────────────────────────────────┘
```

---

### Token Refresh Flow (Detailed)

```
┌────────────┐
│   USER     │
│ (Browsing) │
└─────┬──────┘
      │
      │ Access token expires in < 5 minutes
      │
      ▼
┌─────────────────────────────────────────┐
│  useAuth Hook (Client)                   │
│  ├─ useEffect runs every 10 minutes      │
│  ├─ Calls autoRefreshToken()             │
│  └─ Detects shouldRefreshToken()         │
└─────────────┬───────────────────────────┘
              │
              │ POST /api/auth/refresh-token
              │ (Cookies sent automatically)
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  /api/auth/refresh-token Route (Server)              │
│  ├─ 1. Get refresh_token from cookie                 │
│  ├─ 2. Verify JWT signature & expiry                 │
│  │     Using JWT_REFRESH_SECRET                      │
│  ├─ 3. Hash token with SHA-256                       │
│  ├─ 4. Check database:                               │
│  │     SELECT * FROM refresh_tokens                  │
│  │     WHERE token_hash = ? AND revoked = false      │
│  ├─ 5. Verify not expired in database                │
│  ├─ 6. Get user data from database                   │
│  ├─ 7. Generate NEW access token                     │
│  ├─ 8. Optional: Rotate refresh token                │
│  │     If ROTATE_REFRESH_TOKENS=true:                │
│  │     ├─ Revoke old refresh token                   │
│  │     ├─ Generate new refresh token                 │
│  │     ├─ Store new token hash in database           │
│  │     └─ Set new refresh_token cookie               │
│  ├─ 9. Set new access_token cookie                   │
│  └─ 10. Return success                               │
└─────────────┬────────────────────────────────────────┘
              │
              │ Response: { accessToken, refreshToken? }
              │
              ▼
┌─────────────────────────────────────────┐
│  useAuth Hook (Client)                   │
│  ├─ Update lastTokenRefresh timestamp    │
│  └─ Continue normal operation            │
└─────────────────────────────────────────┘
```

**When Refresh Happens:**
1. **Automatic (Background)**: Every 10 minutes if logged in
2. **On-Demand**: When access token expires (<5 min left)
3. **On Page Load**: If access token expired but refresh valid

---

## Security Model

### 1. JWT Secrets (Critical!)

#### JWT_ACCESS_SECRET
```env
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars-here
```

**What it is**: A secret string used to sign and verify access tokens
**Purpose**: Ensures tokens haven't been tampered with
**How it works**:
- **Signing**: When creating token, server uses secret to create signature
- **Verifying**: When checking token, server uses same secret to verify signature
- **Security**: If attacker modifies token, signature won't match

**Example**:
```typescript
// Signing (Server)
const token = await new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .sign(getAccessSecret()) // Uses JWT_ACCESS_SECRET

// Verifying (Server)
const { payload } = await jwtVerify(token, getAccessSecret())
// If secret is wrong or token tampered → throws error
```

#### JWT_REFRESH_SECRET
```env
JWT_REFRESH_SECRET=your-super-secret-refresh-key-different-from-access
```

**What it is**: A **different** secret for refresh tokens
**Purpose**: Separation of concerns (compromised access token doesn't affect refresh)
**Best Practice**: Use different secrets for access and refresh tokens

**Why separate secrets?**
- If access secret is leaked, refresh tokens remain secure
- Allows rotating one secret without affecting the other
- Defense in depth security strategy

---

### 2. Token Storage Strategy

#### Why httpOnly Cookies?

```typescript
// Setting httpOnly cookie (Server)
response.cookies.set('access_token', token, {
  httpOnly: true,    // ⭐ Cannot be accessed by JavaScript
  secure: true,      // Only sent over HTTPS
  sameSite: 'lax',   // CSRF protection
  path: '/',
  maxAge: 900        // 15 minutes
})
```

**Benefits**:
1. **XSS Protection**: JavaScript can't read tokens (even if malicious script injected)
2. **Automatic Sending**: Browser sends cookies automatically with requests
3. **Secure by Default**: HTTPS-only in production

**Comparison**:

| Storage Method | XSS Risk | CSRF Risk | Auto-Send | Accessibility |
|---------------|----------|-----------|-----------|---------------|
| httpOnly Cookie | ✅ Low | ⚠️ Medium | ✅ Yes | ❌ Server only |
| localStorage | ❌ High | ✅ Low | ❌ No | ✅ JavaScript |
| sessionStorage | ❌ High | ✅ Low | ❌ No | ✅ JavaScript |
| Memory | ✅ Low | ✅ Low | ❌ No | ✅ JavaScript |

**We chose httpOnly cookies** because XSS is more common than CSRF, and we have CSRF protections.

---

### 3. Token Hashing in Database

```typescript
// Why we hash refresh tokens before storing

// ❌ BAD: Store token directly
await db.insert({ token: refreshToken })
// Problem: If database is compromised, attacker has valid tokens

// ✅ GOOD: Store hash
const tokenHash = crypto
  .createHash('sha256')
  .update(refreshToken)
  .digest('hex')
await db.insert({ token_hash: tokenHash })
// Benefit: Even if database leaked, tokens are hashed
```

**How it works:**
1. User logs in → Generate refresh token
2. Hash token with SHA-256
3. Store hash in database
4. On refresh → Hash incoming token and compare with database
5. Match → Valid token, issue new access token

**Why this matters:**
- Database breaches are common
- Hashed tokens are useless to attackers
- User must have original token to authenticate

---

### 4. Token Rotation

```typescript
// Refresh token rotation strategy

// User refreshes token
POST /api/auth/refresh-token

// Server:
if (process.env.ROTATE_REFRESH_TOKENS === 'true') {
  // 1. Revoke old refresh token
  await db.update({ revoked: true }).where({ token_hash: oldHash })
  
  // 2. Generate NEW refresh token
  const newRefreshToken = await signRefreshToken(userData)
  
  // 3. Store new token hash
  await db.insert({ token_hash: newHash, revoked: false })
  
  // 4. Send new refresh token to client
  response.cookies.set('refresh_token', newRefreshToken)
}
```

**Benefits**:
- Limits window of opportunity if refresh token is stolen
- Invalidates old tokens automatically
- Detects stolen tokens (if both old and new tokens are used)

**Trade-offs**:
- Slightly more complex
- More database writes
- Better security

---

### 5. Rate Limiting

```typescript
// OTP rate limiting implementation

// Goal: Prevent SMS spam and brute force
const MAX_OTP_REQUESTS_PER_HOUR = 3

// Check how many OTPs sent in last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
const { data } = await db
  .from('otp_codes')
  .select('id')
  .eq('phone_number', phoneNumber)
  .gte('created_at', oneHourAgo)

if (data.length >= 3) {
  throw new Error('تعداد درخواست‌ها بیش از حد مجاز است')
}
```

**Why this matters**:
- **Cost**: SMS messages cost money
- **Abuse**: Prevents phone number enumeration
- **Security**: Prevents brute force OTP guessing

**Production recommendations**:
- Use Redis for rate limiting (faster than database)
- Implement sliding window algorithm
- Rate limit by IP address too
- Add CAPTCHA after 2-3 failed attempts

---

### 6. OTP Attempt Limiting

```typescript
// Prevent brute force OTP guessing

const MAX_ATTEMPTS = 3

// On verification failure
const { data: otpRecord } = await db
  .from('otp_codes')
  .select('attempts')
  .eq('phone_number', phoneNumber)
  .single()

if (otpRecord.attempts >= MAX_ATTEMPTS) {
  throw new Error('تعداد تلاش‌ها بیش از حد مجاز است. لطفا کد جدید درخواست کنید')
}

// Increment attempts
await db
  .from('otp_codes')
  .update({ attempts: otpRecord.attempts + 1 })
```

**Math**:
- 6-digit OTP = 1,000,000 combinations
- With 3 attempts: 1 in 333,333 chance to guess
- With expiry (2 min) + rate limit: Nearly impossible to brute force

---

## Component Breakdown

### Client-Side Components

#### 1. Authentication Store (Zustand)

**Location**: `src/features/auth/store/authStore.ts`

**Purpose**: Centralized state management for authentication

```typescript
interface AuthState {
  user: UserProfile | null          // Current user data
  isAuthenticated: boolean           // Auth status
  is
Loading: boolean                  // Loading state
  
  // Actions
  setUser: (user) => void            // Set user after login
  clearUser: () => void              // Clear on logout
  setAuthenticated: (status) => void // Update auth status
  logout: () => void                 // Logout action
}
```

**Why Zustand?**
- ✅ Lightweight (1kb vs 3kb for Redux)
- ✅ No boilerplate
- ✅ Built-in persistence
- ✅ TypeScript support
- ✅ Easy to use with React hooks

**Persistence Strategy**:
```typescript
persist(
  (set) => ({ /* state */ }),
  {
    name: 'auth-storage',  // localStorage key
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      // Don't persist: isLoading, tokens (in cookies)
    })
  }
)
```

**What gets persisted**:
- ✅ User profile data
- ✅ isAuthenticated flag
- ❌ Tokens (stored in cookies, not localStorage)
- ❌ Loading states

---

#### 2. Auth Hooks

**Location**: `src/features/auth/hooks/`

##### useAuth()
**Purpose**: Main authentication hook, provides auth state and methods

```typescript
const { 
  user,              // Current user
  isAuthenticated,   // Auth status
  isLoading,         // Loading state
  logout,            // Logout function
  isAdmin,           // Helper: user.role === 'admin'
  isCustomer         // Helper: user.role === 'customer'
} = useAuth()
```

**What it does**:
1. **On Mount**: 
   - Checks cookies for tokens
   - Verifies token validity
   - Fetches full user profile
   - Updates Zustand store

2. **Auto-Refresh**:
   - Runs every 10 minutes
   - Calls `autoRefreshToken()`
   - Prevents token expiry while user is active

3. **Logout**:
   - Calls `/api/auth/logout`
   - Clears cookies
   - Clears localStorage
   - Resets Zustand store
   - Redirects to `/login`

**Example Usage**:
```typescript
function Dashboard() {
  const { user, isLoading, logout } = useAuth()
  
  if (isLoading) return <Spinner />
  
  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

##### useOTPLogin()
**Purpose**: Handles OTP login flow (send + verify)

```typescript
const {
  sendOTP,           // Function: sendOTP(phoneNumber)
  verifyOTP,         // Function: verifyOTP({ phoneNumber, otpCode })
  isSendingOTP,      // Loading state for send
  isVerifyingOTP,    // Loading state for verify
} = useOTPLogin()
```

**Flow**:
```typescript
// 1. Send OTP
sendOTP('09123456789')
// → Calls /api/auth/send-otp
// → Shows success toast
// → Displays countdown timer

// 2. Verify OTP
verifyOTP({ phoneNumber: '09123456789', otpCode: '123456' })
// → Calls /api/auth/verify-otp
// → Updates auth store
// → Merges cart
// → Redirects to profile or home
```

---

##### useGoogleLogin()
**Purpose**: Triggers Google OAuth flow

```typescript
const googleLogin = useGoogleLogin()

// Usage
<button onClick={() => googleLogin.mutate()}>
  Login with Google
</button>
```

**What it does**:
1. Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
2. Redirects to Google consent screen
3. User approves permissions
4. Google redirects to `/callback?code=...`
5. Callback route exchanges code for session
6. Creates user, generates tokens, sets cookies

---

##### useRequireAuth()
**Purpose**: HOC for protecting routes (client-side)

```typescript
function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  if (isLoading) return <Spinner />
  if (!isAuthenticated) return null // Redirects to /login
  
  return <div>Protected Content</div>
}
```

**What it does**:
- Checks `isAuthenticated` on mount
- If false → Redirect to `/login?redirectedFrom=/current-path`
- If true → Render children

---

##### useRequireAdmin()
**Purpose**: Protect admin-only routes

```typescript
function AdminPanel() {
  const { isAdmin, isLoading } = useRequireAdmin()
  
  if (isLoading) return <Spinner />
  if (!isAdmin) return null // Redirects to /
  
  return <div>Admin Content</div>
}
```

---

#### 3. ProtectedRoute Component

**Location**: `src/features/auth/components/ProtectedRoute.tsx`

**Purpose**: Wraps pages/components that require authentication

```typescript
// Usage in page
<ProtectedRoute requireAdmin={false}>
  <YourProtectedContent />
</ProtectedRoute>

// Admin-only
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

**How it works**:
```
┌─────────────────────────┐
│  ProtectedRoute Mount   │
└────────────┬────────────┘
             │
             ▼
      ┌──────────────┐
      │ isLoading?   │
      └──────┬───┬───┘
         Yes │   │ No
             ▼   ▼
      ┌──────────────┐
      │ Show Spinner │
      └──────────────┘
             │
             ▼
      ┌──────────────────┐
      │ isAuthenticated? │
      └──────┬───────┬───┘
          No │       │ Yes
             ▼       ▼
      ┌───────────────────┐
      │ Redirect to Login │
      └───────────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ requireAdmin?│
            └──────┬───┬───┘
                No │   │ Yes
                   ▼   ▼
            ┌──────────────┐
            │ isAdmin?     │
            └──────┬───┬───┘
                No │   │ Yes
                   ▼   ▼
            ┌──────────────┐  ┌──────────────┐
            │ Redirect to /│  │Render Content│
            └──────────────┘  └──────────────┘
```

**States**:
1. **Loading**: Shows spinner while checking auth
2. **Not Authenticated**: Redirects to `/login`
3. **Not Admin** (if required): Shows error or redirects
4. **Authenticated**: Renders children

---

#### 4. Session Service

**Location**: `src/features/auth/services/sessionService.ts`

**Purpose**: Low-level session operations (no React)

```typescript
// Get current session
const session = getSession()
// Returns: { isAuthenticated, user, accessTokenExpiry, needsRefresh }

// Check if authenticated
const isAuth = isAuthenticated()

// Get user from session
const user = getUserFromSession()

// Check if needs refresh
const needsRefresh = sessionNeedsRefresh()

// Refresh session
await refreshSession()

// Clear session (logout)
clearSession()

// Auto-refresh token
await autoRefreshToken()
```

**Key Functions**:

##### getSession()
```typescript
function getSession(): ClientSessionInfo {
  // 1. Get access_token from cookie
  const accessToken = getAccessTokenClient()
  
  // 2. If no token → not authenticated
  if (!accessToken) {
    return { isAuthenticated: false, user: null, needsRefresh: false }
  }
  
  // 3. Check if expired
  if (isTokenExpired(accessToken)) {
    return { isAuthenticated: false, user: null, needsRefresh: true }
  }
  
  // 4. Decode token to get user info
  const payload = decodeTokenUnsafe(accessToken)
  
  // 5. Return session info
  return {
    isAuthenticated: true,
    user: { id: payload.userId, role: payload.role, ... },
    accessTokenExpiry: payload.exp * 1000,
    needsRefresh: shouldRefreshToken(accessToken)
  }
}
```

##### autoRefreshToken()
```typescript
async function autoRefreshToken() {
  const session = getSession()
  
  // Case 1: Token expired, try to refresh
  if (session.needsRefresh && !session.isAuthenticated) {
    const refreshToken = getRefreshTokenClient()
    if (refreshToken) {
      await refreshSession()
    }
  }
  
  // Case 2: Token expiring soon, refresh proactively
  else if (session.isAuthenticated && session.needsRefresh) {
    await refreshSession()
  }
}
```

**When autoRefreshToken() runs**:
1. On app mount (in `useAuth()` hook)
2. Every 10 minutes (interval in `useAuth()`)
3. Before making important API calls
4. On route changes (optional)

---

### Server-Side Components

#### 1. Next.js Middleware

**Location**: `app/middleware.ts`

**Purpose**: Edge-level authentication check (runs before page renders)

**Execution Flow**:
```
User Request
     ↓
Middleware Runs ← Runs on Vercel Edge (Closest to user)
     ↓
  ┌──────────────────┐
  │ Extract Cookies  │
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ Check Route Type │
  └────────┬─────────┘
           ↓
    ┌─────────────┐
    │ Public?     │
    └─────┬───┬───┘
       Yes│   │No
          ↓   ↓
    ┌──────────────┐
    │ Allow Access │
    └──────────────┘
                │
                ↓
         ┌──────────────┐
         │ Protected?   │
         └──────┬───────┘
                │
                ↓
         ┌──────────────────┐
         │ Has access_token?│
         └──────┬───────────┘
             No │   │ Yes
                ↓   ↓
         ┌────────────────┐
         │ Redirect /login│
         └────────────────┘
                     │
                     ↓
              ┌──────────────┐
              │ Verify Token │
              └──────┬───────┘
                  Valid│
                     ↓
              ┌──────────────┐
              │ Check Role   │
              │ (if admin)   │
              └──────┬───────┘
                     │
                     ↓
              ┌──────────────┐
              │ Allow Access │
              └──────────────┘
                     ↓
                Page Renders
```

**Route Configuration**:
```typescript
const PROTECTED_ROUTES = ['/profile', '/orders', '/checkout']
const ADMIN_ROUTES = ['/admin']
const PUBLIC_ROUTES = ['/', '/login', '/products']
```

**Why use Middleware?**
- ✅ Runs before page loads (faster than client-side checks)
- ✅ Prevents flash of protected content
- ✅ Server-side token verification (more secure)
- ✅ Works with SSR and SSG pages
- ✅ Runs on Edge (low latency)

**Performance Benefits**:
- No hydration needed
- No client-side JavaScript execution for auth check
- Redirect happens before page assets are loaded

---

#### 2. API Routes

##### /api/auth/send-otp

**Input**:
```json
{
  "phoneNumber": "09123456789"
}
```

**Process**:
1. **Validate** phone format (regex)
2. **Rate Limit** check (max 3/hour)
3. **Generate** 6-digit OTP
4. **Delete** old OTPs for this phone
5. **Save** to database:
   ```sql
   INSERT INTO otp_codes (phone_number, otp_code, expires_at, verified, attempts)
   VALUES ('09123456789', '123456', NOW() + INTERVAL '2 minutes', false, 0)
   ```
6. **Convert** phone to Kavenegar format (98...)
7. **Send** SMS via Kavenegar
8. **Return** success

**Output**:
```json
{
  "success": true,
  "data": {
    "expiresIn": 120,
    "debug": { "otpCode": "123456" }  // Only in dev
  }
}
```

**Error Handling**:
```typescript
try {
  // ... logic
} catch (error) {
  if (error.name === 'AppError') {
    // Custom app errors
    return errorResponse(error.message, error.statusCode)
  }
  // Unknown errors
  return errorResponse('خطا در ارسال کد تایید', 500)
}
```

---

##### /api/auth/verify-otp

**Input**:
```json
{
  "phoneNumber": "09123456789",
  "otpCode": "123456"
}
```

**Process**:
1. **Find** OTP in database:
   ```sql
   SELECT * FROM otp_codes 
   WHERE phone_number = ? 
     AND otp_code = ? 
     AND verified = false 
     AND expires_at > NOW()
   ```
2. **Check** attempts < 3
3. **Mark** OTP as verified
4. **Check** if user exists:
   ```sql
   SELECT * FROM users WHERE phone_number = ?
   ```
5. **Create** user if new:
   ```sql
   INSERT INTO users (id, phone_number, role, profile_completed)
   VALUES (UUID(), '09123456789', 'customer', false)
   ```
6. **Generate** JWT token pair:
   ```typescript
   const tokens = await generateTokenPair({
     userId: user.id,
     phoneNumber: user.phone_number,
     role: user.role
   })
   ```
7. **Hash** refresh token:
   ```typescript
   const hash = crypto.createHash('sha256')
     .update(tokens.refreshToken)
     .digest('hex')
   ```
8. **Store** refresh token:
   ```sql
   INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
   VALUES (?, ?, NOW() + INTERVAL '7 days')
   ```
9. **Set** cookies:
   ```typescript
   setAuthTokens(tokens.accessToken, tokens.refreshToken)
   ```
10. **Return** user data

**Output**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "phoneNumber": "09123456789",
    "isNewUser": true,
    "profileCompleted": false,
    "role": "customer"
  }
}
```

---

##### /api/auth/refresh-token

**Input**: None (uses cookies)

**Process**:
1. **Extract** refresh_token from cookie
2. **Verify** JWT signature and expiry
3. **Hash** token for lookup
4. **Check** database:
   ```sql
   SELECT * FROM refresh_tokens 
   WHERE token_hash = ? 
     AND revoked = false 
     AND expires_at > NOW()
   ```
5. **Get** user data:
   ```sql
   SELECT * FROM users WHERE id = ?
   ```
6. **Generate** new access token
7. **Optional**: Rotate refresh token
   - Revoke old token
   - Generate new refresh token
   - Store new hash
8. **Set** new cookies
9. **Return** tokens

**Output**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."  // If rotated
  }
}
```

---

##### /api/auth/logout

**Input**: None (uses cookies)

**Process**:
1. **Extract** refresh_token from cookie
2. **Hash** token
3. **Revoke** in database:
   ```sql
   UPDATE refresh_tokens 
   SET revoked = true 
   WHERE token_hash = ?
   ```
4. **Clear** cookies:
   ```typescript
   clearAuthCookies()
   ```
5. **Return** success

**Output**:
```json
{
  "success": true,
  "data": { "loggedOut": true }
}
```

**Note**: Even if revocation fails, we still clear cookies and return success (better UX than showing error on logout)

---

##### /callback (Google OAuth)

**Input**: URL params `?code=abc&redirectedFrom=/`

**Process**:
1. **Extract** code from URL
2. **Exchange** code for session:
   ```typescript
   const { data } = await supabase.auth.exchangeCodeForSession(code)
   ```
3. **Get** user data from Supabase:
   ```typescript
   {
     id: 'supabase-user-id',
     email: 'user@gmail.com',
     user_metadata: {
       full_name: 'John Doe',
       avatar_url: '...'
     }
   }
   ```
4. **Check** if user exists in our database
5. **Create** user if new
6. **Generate** JWT tokens (same as OTP flow)
7. **Set** cookies
8. **Redirect** to profile or original destination

**Why separate from OTP flow?**
- OAuth uses Supabase Auth (managed service)
- Email as primary identifier vs phone
- Different user metadata structure
- OAuth session handled by Supabase

---

#### 3. Supabase Integration

**What Supabase Does**:

##### Supabase Database (PostgreSQL)
- Stores `users` table
- Stores `otp_codes` table
- Stores `refresh_tokens` table
- Row-level security (RLS) policies
- Real-time subscriptions (optional)

**Client Configuration**:
```typescript
// Browser client (anon key)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Use for:
// - OAuth flows
// - Client-side database queries
// - Real-time subscriptions
```

**Server Configuration**:
```typescript
// Admin client (service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Use for:
// - Creating users
// - Storing OTPs
// - Managing refresh tokens
// - Bypassing RLS (when needed)
```

**Why two clients?**
- **Anon Key**: Safe to expose to client, respects RLS
- **Service Role Key**: Bypasses RLS, server-only, full access

##### Supabase Auth (OAuth Only)
```typescript
// Trigger OAuth flow
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/callback`
  }
})

// Exchange code for session
await supabase.auth.exchangeCodeForSession(code)

// Sign out (OAuth only)
await supabase.auth.signOut()
```

**Important**: We only use Supabase Auth for OAuth. OTP auth is custom-built using Next.js API routes.

---

#### 4. Kavenegar Integration

**Location**: `src/shared/lib/kavenegar/client.ts`

**Purpose**: Send SMS for OTP

**Configuration**:
```typescript
const kavenegarApi = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY
})
```

**Main Functions**:

##### sendOTPSMS()
```typescript
async function sendOTPSMS(phoneNumber: string, otpCode: string) {
  // Convert to Kavenegar format
  const phone = toKavenegarFormat(phoneNumber)
  // '09123456789' → '989123456789'
  
  // Send SMS
  const result = await kavenegarApi.Send({
    message: `کد تایید شما: ${otpCode}\nاعتبار: 2 دقیقه`,
    sender: process.env.KAVENEGAR_SENDER,
    receptor: phone
  })
  
  return result
}
```

**Phone Format Conversion**:
```typescript
// Our format: 09123456789
// Kavenegar format: 989123456789

function toKavenegarFormat(phone: string): string {
  if (phone.startsWith('0')) {
    return '98' + phone.slice(1)
  }
  return phone
}
```

**SMS Template** (optional):
```typescript
// Instead of raw SMS, can use Kavenegar templates
await kavenegarApi.VerifyLookup({
  receptor: phone,
  token: otpCode,
  template: 'otp-verify'  // Created in Kavenegar dashboard
})
```

**Benefits of templates**:
- Better delivery rates
- Consistent formatting
- Easier to update message
- Support for multiple languages

---

## Environment Variables

### Complete .env.local Template

```bash
# =====================================================
# JWT SECRETS (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# =====================================================
# CRITICAL: These must be strong, random, and different from each other
JWT_ACCESS_SECRET=your-64-char-hex-string-here-min-32-chars-recommended-64
JWT_REFRESH_SECRET=different-64-char-hex-string-never-reuse-access-secret

# JWT Token Expiry
JWT_ACCESS_EXPIRY=15m    # Access token expires in 15 minutes
JWT_REFRESH_EXPIRY=7d    # Refresh token expires in 7 days

# =====================================================
# SUPABASE
# =====================================================
# Get from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Safe to expose to client
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...      # NEVER expose to client!

# =====================================================
# KAVENEGAR (SMS)
# =====================================================
# Get from: Kavenegar Dashboard → API Key
KAVENEGAR_API_KEY=your-kavenegar-api-key-here
KAVENEGAR_SENDER=10004346  # Your sender number (10-digit)

# =====================================================
# APPLICATION
# =====================================================
# Application URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Dev
# NEXT_PUBLIC_APP_URL=https://yourapp.com  # Production

# Node environment
NODE_ENV=development  # or 'production'

# =====================================================
# OPTIONAL SETTINGS
# =====================================================
# Refresh token rotation (recommended for production)
ROTATE_REFRESH_TOKENS=true

# Rate limiting
MAX_OTP_REQUESTS_PER_HOUR=3
OTP_EXPIRY_MINUTES=2
MAX_OTP_ATTEMPTS=3
```

---

### How to Generate Secrets

#### Method 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output:
```
a7f3d9e2b8c4f6a1d9e7b3c5f8a2d4e6b9c1f7a3d5e8b2c4f6a9d1e3b5c7f9a2
```

#### Method 2: OpenSSL
```bash
openssl rand -hex 32
```

#### Method 3: Online Generator
- Visit: https://generate-secret.vercel.app/32
- Or use: `uuidgen` on macOS/Linux

**Security Rules**:
1. ✅ Use different secrets for access and refresh tokens
2. ✅ Minimum 32 characters (64 recommended)
3. ✅ Never commit secrets to git
4. ✅ Use different secrets for dev/staging/production
5. ✅ Rotate secrets periodically (every 90 days)
6. ❌ Never use simple strings like "my-secret-key"

---

### Environment Variable Priority

```
Production > Staging > Development

1. Vercel Environment Variables (Production)
2. .env.production.local (Git-ignored)
3. .env.local (Git-ignored)
4. .env.production (Committed)
5. .env (Committed - defaults only)
```

**.gitignore**:
```
# Environment variables
.env.local
.env.*.local
.env.production.local

# Keep these for defaults
!.env.example
```

---

## Database Schema

### Complete SQL Schema

```sql
-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(11) UNIQUE,          -- 09XXXXXXXXX format
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'customer',  -- 'customer' or 'admin'
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin')),
  CONSTRAINT users_contact_check CHECK (
    phone_number IS NOT NULL OR email IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_users_phone ON public.users(phone_number);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- =====================================================
-- OTP_CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(11) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT otp_codes_code_format CHECK (otp_code ~ '^\d{6}$'),
  CONSTRAINT otp_codes_attempts_check CHECK (attempts >= 0 AND attempts <= 10)
);

-- Indexes
CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone_number);
CREATE INDEX idx_otp_codes_expires ON public.otp_codes(expires_at);
CREATE INDEX idx_otp_codes_verified ON public.otp_codes(verified) WHERE verified = FALSE;

-- =====================================================
-- REFRESH_TOKENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT refresh_tokens_user_fk FOREIGN KEY (user_id) 
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON public.refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON public.refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON public.refresh_tokens(revoked) 
  WHERE revoked = FALSE;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_refresh_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_tokens_updated_at
  BEFORE UPDATE ON public.refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_refresh_tokens_updated_at();

-- =====================================================
-- CLEANUP FUNCTION (Optional - Run with cron)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  -- Delete expired OTPs
  DELETE FROM public.otp_codes WHERE expires_at < NOW();
  
  -- Delete expired/revoked refresh tokens
  DELETE FROM public.refresh_tokens 
  WHERE expires_at < NOW() OR revoked = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Run cleanup (manually or with pg_cron extension)
-- SELECT cleanup_expired_tokens();
```

---

### Table Relationships Diagram

```
┌─────────────────────────────────┐
│          USERS                  │
│  ┌───────────────────────────┐  │
│  │ id (PK)                   │  │
│  │ phone_number (UNIQUE)     │  │
│  │ email (UNIQUE)            │  │
│  │ full_name                 │  │
│  │ role                      │  │
│  │ profile_completed         │  │
│  │ created_at                │  │
│  │ updated_at                │  │
│  └───────────────────────────┘  │
└─────────────┬───────────────────┘
              │
              │ 1:N
              │
┌─────────────▼───────────────────┐
│      REFRESH_TOKENS             │
│  ┌───────────────────────────┐  │
│  │ id (PK)                   │  │
│  │ user_id (FK) ────────────────┼──┐
│  │ token_hash (UNIQUE)       │  │  │
│  │ expires_at                │  │  │
│  │ revoked                   │  │  │
│  │ created_at                │  │  │
│  │ updated_at                │  │  │
│  └───────────────────────────┘  │  │
└─────────────────────────────────┘  │
                                     │
              ┌──────────────────────┘
              │ ON DELETE CASCADE
              │
              │
┌─────────────────────────────────┐
│         OTP_CODES               │
│  ┌───────────────────────────┐  │
│  │ id (PK)                   │  │
│  │ phone_number              │  │
│  │ otp_code                  │  │
│  │ expires_at                │  │
│  │ verified                  │  │
│  │ attempts                  │  │
│  │ created_at                │  │
│  └──────────────────────┘  │
└─────────────────────────────────┘
(No FK - OTPs are temporary)
```

---

### Row Level Security (RLS) Policies

**Optional but recommended for production**:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update their own data
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Refresh tokens: Users can only see their own tokens
CREATE POLICY "Users can read own refresh tokens"
  ON public.refresh_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- OTP codes: No direct access (only via service role)
-- Service role bypasses RLS automatically

-- Admin: Full access
CREATE POLICY "Admins have full access"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Note**: Since we're using custom JWT (not Supabase Auth JWT), you may need to adjust RLS policies or bypass them using service role key.

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/send-otp

Send OTP code to phone number.

**Request**:
```typescript
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "09123456789"
}
```

**Response (Success)**:
```typescript
200 OK
{
  "success": true,
  "data": {
    "expiresIn": 120,
    "debug": {
      "otpCode": "123456"  // Only in NODE_ENV=development
    }
  },
  "message": "کد تایید ارسال شد"
}
```

**Response (Error - Rate Limited)**:
```typescript
429 Too Many Requests
{
  "success": false,
  "error": "حداکثر 3 درخواست در ساعت مجاز است",
  "code": 6001
}
```

**Response (Error - Invalid Phone)**:
```typescript
400 Bad Request
{
  "success": false,
  "error": "فرمت شماره موبایل باید 09XXXXXXXXX باشد",
  "code": 3003
}
```

---

#### POST /api/auth/verify-otp

Verify OTP code and create session.

**Request**:
```typescript
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "09123456789",
  "otpCode": "123456"
}
```

**Response (Success - New User)**:
```typescript
200 OK
Set-Cookie: access_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax

{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "phoneNumber": "09123456789",
    "isNewUser": true,
    "profileCompleted": false,
    "role": "customer"
  },
  "message": "حساب کاربری با موفقیت ایجاد شد"
}
```

**Response (Success - Existing User)**:
```typescript
200 OK
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax

{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "phoneNumber": "09123456789",
    "isNewUser": false,
    "profileCompleted": true,
    "role": "customer"
  },
  "message": "ورود موفقیت‌آمیز"
}
```

**Response (Error - Invalid OTP)**:
```typescript
400 Bad Request
{
  "success": false,
  "error": "کد تایید نامعتبر یا منقضی شده است",
  "code": 2002
}
```

**Response (Error - Max Attempts)**:
```typescript
429 Too Many Requests
{
  "success": false,
  "error": "تعداد تلاش‌ها بیش از حد مجاز است. لطفا کد جدید درخواست کنید",
  "code": 2003
}
```

---

#### POST /api/auth/refresh-token

Refresh expired access token using refresh token.

**Request**:
```typescript
POST /api/auth/refresh-token
Cookie: refresh_token=eyJhbGc...
```

**Response (Success)**:
```typescript
200 OK
Set-Cookie: access_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax (if rotated)

{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."  // Only if ROTATE_REFRESH_TOKENS=true
  },
  "message": "توکن با موفقیت تازه‌سازی شد"
}
```

**Response (Error - Token Expired)**:
```typescript
401 Unauthorized
{
  "success": false,
  "error": "زمان اعتبار توکن تازه‌سازی به پایان رسیده است",
  "code": 7001
}
```

**Response (Error - Token Revoked)**:
```typescript
401 Unauthorized
{
  "success": false,
  "error": "توکن تازه‌سازی باطل شده است",
  "code": 7003
}
```

---

#### POST /api/auth/logout

Logout user and revoke refresh token.

**Request**:
```typescript
POST /api/auth/logout
Cookie: refresh_token=eyJhbGc...
```

**Response (Success)**:
```typescript
200 OK
Set-Cookie: access_token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
Set-Cookie: refresh_token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT

{
  "success": true,
  "data": {
    "loggedOut": true
  },
  "message": "خروج با موفقیت انجام شد"
}
```

**Note**: Logout always returns success, even if token revocation fails. This ensures better UX.

---

#### GET /callback

Handle Google OAuth callback.

**Request**:
```typescript
GET /callback?code=abc123&redirectedFrom=/dashboard
```

**Process**:
1. Exchange code for session via Supabase
2. Create/update user in database
3. Generate JWT tokens
4. Set cookies
5. Redirect to destination

**Response**:
```typescript
302 Found
Location: /dashboard (or /profile if !profileCompleted)
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax
```

**Error Redirects**:
- No code: `/login?error=oauth_code_missing`
- Exchange failed: `/login?error=oauth_failed`
- User creation failed: `/login?error=user_creation_failed`
- Unknown error: `/login?error=oauth_error`

---

### Error Codes Reference

| Code | Category | Error | Description |
|------|----------|-------|-------------|
| 1001 | Auth | INVALID_CREDENTIALS | اطلاعات ورود نامعتبر است |
| 1002 | Auth | TOKEN_EXPIRED | زمان اعتبار توکن به پایان رسیده است |
| 1003 | Auth | INVALID_TOKEN | توکن نامعتبر است |
| 1004 | Auth | UNAUTHORIZED | لطفا وارد حساب کاربری خود شوید |
| 1005 | Auth | FORBIDDEN | شما به این بخش دسترسی ندارید |
| 1006 | Auth | MISSING_TOKEN | توکن یافت نشد |
| 1007 | Auth | INVALID_TOKEN_TYPE | نوع توکن اشتباه است |
| 1008 | Auth | INVALID_SIGNATURE | امضای توکن نامعتبر است |
| 2001 | OTP | OTP_EXPIRED | کد تایید منقضی شده است |
| 2002 | OTP | OTP_INVALID | کد تایید نامعتبر است |
| 2003 | OTP | OTP_MAX_ATTEMPTS | تعداد تلاش‌ها بیش از حد مجاز است |
| 2004 | OTP | OTP_SEND_FAILED | خطا در ارسال کد تایید |
| 2005 | OTP | OTP_NOT_FOUND | کد تایید یافت نشد |
| 2006 | OTP | OTP_ALREADY_VERIFIED | کد تایید قبلا استفاده شده است |
| 3001 | User | USER_NOT_FOUND | کاربر یافت نشد |
| 3002 | User | USER_ALREADY_EXISTS | کاربر از قبل وجود دارد |
| 3003 | User | INVALID_PHONE | شماره موبایل نامعتبر است |
| 3004 | User | INVALID_EMAIL | ایمیل نامعتبر است |
| 3005 | User | PROFILE_INCOMPLETE | لطفا پروفایل خود را تکمیل کنید |
| 4001 | Validation | VALIDATION_ERROR | اطلاعات وارد شده نامعتبر است |
| 4002 | Validation | MISSING_REQUIRED_FIELD | فیلد الزامی وارد نشده است |
| 4003 | Validation | INVALID_FORMAT | فرمت ورودی نامعتبر است |
| 4004 | Validation | INVALID_INPUT | ورودی نامعتبر است |
| 5001 | Server | SERVER_ERROR | خطای سرور، لطفا دوباره تلاش کنید |
| 5002 | Server | DATABASE_ERROR | خطا در پایگاه داده |
| 5003 | Server | EXTERNAL_API_ERROR | خطا در ارتباط با سرویس خارجی |
| 5004 | Server | CONFIG_ERROR | خطای پیکربندی سرور |
| 6001 | Rate Limit | RATE_LIMIT_EXCEEDED | تعداد درخواست‌ها بیش از حد مجاز است |
| 7001 | Token | REFRESH_TOKEN_EXPIRED | زمان اعتبار توکن تازه‌سازی به پایان رسیده است |
| 7002 | Token | REFRESH_TOKEN_INVALID | توکن تازه‌سازی نامعتبر است |
| 7003 | Token | REFRESH_TOKEN_REVOKED | توکن تازه‌سازی باطل شده است |
| 7004 | Token | TOKEN_ROTATION_FAILED | خطا در تازه‌سازی توکن |

---

## Client-Side Implementation

### Component Usage Examples

#### 1. Login Page

```typescript
// app/(auth)/login/page.tsx
import OTPLoginForm from '@/features/auth/components/OTPLoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <OTPLoginForm />
    </div>
  )
}
```

---

#### 2. Protected Page

```typescript
// app/dashboard/page.tsx
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, logout } = useAuth()
  
  return (
    <div>
      <h1>Welcome, {user?.fullName || user?.phoneNumber}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

#### 3. Admin Page

```typescript
// app/admin/page.tsx
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}

function AdminDashboard() {
  return <div>Admin Panel</div>
}
```

---

#### 4. Navbar with User Menu

```typescript
// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/useAuth'
import UserMenu from '@/features/auth/components/UserMenu'

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth()
  
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          My App
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/products">Products</Link>
          
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link 
                  href="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
```

---

#### 5. Root Layout with Auth Provider

```typescript
// app/layout.tsx
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/features/auth/components/AuthProvider'
import ReactQueryProvider from '@/providers/ReactQueryProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
```

---

#### 6. Custom Hook Usage

```typescript
// Custom component with auth
'use client'

import { useAuth } from '@/features/auth/hooks/useAuth'

export default function ProfileButton() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Link href="/login">Login</Link>
  }
  
  return (
    <div>
      <p>Hello, {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

### State Management Flow

```
┌─────────────────────────────────────────────────────┐
│                   APP MOUNT                          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  useAuth() Hook Initializes                          │
│  ├─ Check cookies for access_token                   │
│  ├─ If token exists & valid:                         │
│  │  └─ Fetch user profile from database              │
│  └─ Update Zustand store                             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Zustand Store Updated                               │
│  ├─ user: { id, phoneNumber, role, ... }            │
│  ├─ isAuthenticated: true                            │
│  └─ isLoading: false                                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  All Components Re-render                            │
│  ├─ Navbar shows UserMenu                            │
│  ├─ Protected routes allow access                    │
│  └─ Login page redirects to dashboard                │
└─────────────────────────────────────────────────────┘
                       │
                       │ User browses app
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Auto-Refresh (Every 10 minutes)                     │
│  ├─ Check if token expiring soon                     │
│  ├─ Call /api/auth/refresh-token                     │
│  └─ Update cookies silently                          │
└─────────────────────────────────────────────────────┘
                       │
                       │ User clicks logout
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Logout Flow                                         │
│  ├─ Call /api/auth/logout                            │
│  ├─ Clear cookies (server-side)                      │
│  ├─ Clear localStorage                               │
│  ├─ Reset Zustand store                              │
│  └─ Redirect to /login                               │
└─────────────────────────────────────────────────────┘
```

---

## Server-Side Implementation

### Middleware Protection Flow

```typescript
// Request flow with middleware

User requests /dashboard
        ↓
Next.js Middleware runs
        ↓
Extract access_token from cookies
        ↓
    ┌─────────────┐
    │ Has token?  │
    └──────┬──────┘
       No  │  Yes
           │
    ┌──────▼──────┐
    │ Redirect to │
    │   /login    │
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │Verify token │
    │ signature   │
    └──────┬──────┘
      Valid│Invalid
           │
    ┌──────▼──────┐
    │ Clear token │
    │ Redirect to │
    │   /login    │
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │Check expiry │
    └──────┬──────┘
    Expired│Valid
           │
    ┌──────▼──────┐
    │ Redirect to │
    │   /login    │
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │ Admin route?│
    └──────┬──────┘
        No │  Yes
           │
    ┌──────▼──────┐
    │Check role   │
    │ === 'admin' │
    └──────┬──────┘
        No │  Yes
           │
    ┌──────▼──────┐
    │ Redirect to │
    │     /       │
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │Allow access │
    │Render page  │
    └─────────────┘
```

---

### API Route Structure

All API routes follow this pattern:

```typescript
// app/api/auth/[endpoint]/route.ts

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json()
    
    // 2. Validate inputs
    if (!body.field) {
      throw createValidationError('Field required')
    }
    
    // 3. Business logic
    const result = await someOperation(body)
    
    // 4. Return success
    return successResponse(result, 'Success message')
    
  } catch (error: any) {
    // 5. Handle errors
    logError(error, 'endpoint-name')
    
    if (error.name === 'AppError') {
      return errorResponse(error.message, error.statusCode, {
        code: error.code
      })
    }
    
    return errorResponse('Generic error', 500)
  }
}
```

---

### Helper Functions

#### Cookie Management

```typescript
// Server-side (API routes)
import { setAuthTokens, clearAuthCookies } from '@/shared/utils/cookies'

// Set tokens
setAuthTokens(accessToken, refreshToken)

// Clear on logout
clearAuthCookies()

// Client-side
import { getAccessTokenClient, clearAuthCookiesClient } from '@/shared/utils/cookies'

// Get token
const token = getAccessTokenClient()

// Clear on logout
clearAuthCookiesClient()
```

---

#### Database Operations

```typescript
// Get user by phone
import { getUserByPhone } from '@/shared/lib/supabase/server'

const user = await getUserByPhone('09123456789')

// Create user
import { createUserRecord } from '@/shared/lib/supabase/server'

const newUser = await createUserRecord({
  id: crypto.randomUUID(),
  phoneNumber: '09123456789',
  role: 'customer'
})

// Store refresh token
import { storeRefreshToken } from '@/shared/lib/supabase/server'

await storeRefreshToken({
  userId: user.id,
  tokenHash: hashToken(refreshToken),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})

// Check if refresh token valid
import { isRefreshTokenValid } from '@/shared/lib/supabase/server'

const isValid = await isRefreshTokenValid(tokenHash)

// Revoke refresh token
import { revokeRefreshToken } from '@/shared/lib/supabase/server'

await revokeRefreshToken(tokenHash)
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Token expired" errors

**Problem**: User keeps getting logged out

**Causes**:
- Access token expired (15 min)
- Refresh token expired (7 days)
- Auto-refresh not working

**Solutions**:
```typescript
// Check if auto-refresh is running
useEffect(() => {
  console.log('Auto-refresh active:', isAuthenticated)
  
  const interval = setInterval(() => {
    console.log('Running auto-refresh')
    autoRefreshToken()
  }, 10 * 60 * 1000)
  
  return () => clearInterval(interval)
}, [isAuthenticated])

// Manually trigger refresh
import { refreshSession } from '@/features/auth/services/sessionService'

try {
  await refreshSession()
  console.log('Token refreshed successfully')
} catch (error) {
  console.error('Refresh failed:', error)
  // Redirect to login
}
```

---

#### 2. "Invalid signature" errors

**Problem**: JWT verification fails

**Causes**:
- Wrong JWT secret
- Token tampered with
- Secret changed after token was issued

**Solutions**:
```bash
# Check secrets are set
echo $JWT_ACCESS_SECRET
echo $JWT_REFRESH_SECRET

# Regenerate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_ACCESS_SECRET=new-secret-here
JWT_REFRESH_SECRET=different-new-secret-here

# Restart dev server
```

**Note**: Changing secrets invalidates all existing tokens. Users must login again.

---

#### 3. OTP not received

**Problem**: SMS not arriving

**Causes**:
- Kavenegar API key invalid
- Sender number not activated
- Phone number format incorrect
- SMS quota exceeded

**Solutions**:
```typescript
// Check logs for Kavenegar errors
console.log('Kavenegar response:', response)

// Test in development (OTP shown in console/toast)
if (process.env.NODE_ENV === 'development') {
  console.log('OTP Code:', otpCode)
}

// Check phone format
const phone = '09123456789'  // Correct
const phone = '9123456789'   // Wrong (missing 0)
const phone = '+989123456789'// Wrong (has +)

// Check Kavenegar dashboard
// - API key active?
// - Sender number verified?
// - SMS credit available?
```

---

#### 4. Cookies not being set

**Problem**: Tokens not persisting across requests

**Causes**:
- `httpOnly` flag blocking JavaScript access
- `Secure` flag but not using HTTPS
- `SameSite` misconfiguration
- Domain mismatch

**Solutions**:
```typescript
// Check cookie settings
response.cookies.set('access_token', token, {
  httpOnly: true,           // ✅ Correct for security
  secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS only in prod
  sameSite: 'lax',          // ✅ Correct for most cases
  path: '/',                // ✅ Available on all routes
  maxAge: 15 * 60,          // ✅ 15 minutes
  domain: undefined         // ✅ Let browser decide
})

// For development with localhost
// Set secure: false
secure: false  // Only for development!

// Check if cookies are set
document.cookie  // Should show cookies (except httpOnly ones)

// In browser DevTools → Application → Cookies
// Check if access_token and refresh_token exist
```

---

#### 5. Middleware redirect loop

**Problem**: Infinite redirects between `/login` and `/dashboard`

**Causes**:
- Login page is marked as protected
- Token verification failing
- Middleware matching wrong routes

**Solutions**:
```typescript
// Ensure /login is public
const PUBLIC_ROUTES = [
  '/',
  '/login',      // ✅ Must be public!
  '/callback',   // ✅ OAuth callback must be public!
  '/products'
]

// Check middleware config
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
    // ✅ Excludes API routes
  ],
}

// Debug middleware
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('Middleware running for:', path)
  
  // ... rest of logic
}
```

---

#### 6. CORS errors with API routes

**Problem**: Browser blocks API requests

**Causes**:
- Wrong origin
- Missing CORS headers
- Preflight request failing

**Solutions**:
```typescript
// Add CORS headers to API routes
export async function POST(request: NextRequest) {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  }
  
  // ... your logic
  
  // Add CORS headers to response
  const response = successResponse(data)
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
}
```

**Note**: With Next.js API routes on same domain, CORS shouldn't be needed.

---

#### 7. Supabase connection errors

**Problem**: Database queries failing

**Causes**:
- Wrong Supabase URL
- Invalid API keys
- RLS policies blocking access
- Network issues

**Solutions**:
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/users \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Use service role key for admin operations
import { supabaseAdmin } from '@/shared/lib/supabase/server'

// This bypasses RLS
const { data } = await supabaseAdmin
  .from('users')
  .select('*')
```

---

#### 8. Token refresh fails silently

**Problem**: User gets logged out unexpectedly

**Causes**:
- Refresh token expired
- Refresh token revoked
- Database connection lost
- Refresh endpoint not called

**Solutions**:
```typescript
// Add logging to refresh flow
async function refreshSession(): Promise<boolean> {
  try {
    console.log('🔄 Attempting token refresh...')
    
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('❌ Refresh failed:', await response.text())
      return false
    }
    
    console.log('✅ Token refreshed successfully')
    return true
  } catch (error) {
    console.error('❌ Refresh error:', error)
    return false
  }
}

// Check refresh token in database
SELECT * FROM refresh_tokens 
WHERE user_id = 'user-id' 
  AND revoked = false 
  AND expires_at > NOW()

// If no valid token found, user must login again
```

---

### Debug Checklist

When auth isn't working, check these in order:

```
☐ 1. Environment variables set correctly
   ├─ JWT_ACCESS_SECRET (32+ chars, different from refresh)
   ├─ JWT_REFRESH_SECRET (32+ chars, different from access)
   ├─ NEXT_PUBLIC_SUPABASE_URL
   ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
   ├─ SUPABASE_SERVICE_ROLE_KEY
   ├─ KAVENEGAR_API_KEY
   └─ KAVENEGAR_SENDER

☐ 2. Database tables exist
   ├─ users
   ├─ otp_codes
   └─ refresh_tokens

☐ 3. Dependencies installed
   ├─ jose (JWT)
   ├─ @supabase/supabase-js
   ├─ @supabase/ssr
   ├─ kavenegar
   ├─ zustand
   ├─ @tanstack/react-query
   └─ react-hot-toast

☐ 4. Cookies being set correctly
   ├─ Check browser DevTools → Application → Cookies
   ├─ access_token present (httpOnly)
   ├─ refresh_token present (httpOnly)
   └─ Both have correct expiry times

☐ 5. API routes responding
   ├─ POST /api/auth/send-otp → 200 OK
   ├─ POST /api/auth/verify-otp → 200 OK
   ├─ POST /api/auth/refresh-token → 200 OK
   └─ POST /api/auth/logout → 200 OK

☐ 6. Middleware working
   ├─ Public routes accessible without auth
   ├─ Protected routes redirect to /login
   └─ Admin routes check role correctly

☐ 7. Client state synced
   ├─ useAuth() returns correct state
   ├─ Zustand store persisting
   └─ Auto-refresh running (every 10 min)

☐ 8. SMS/OAuth working
   ├─ Kavenegar sending SMS (check logs)
   ├─ OTP arriving on phone
   ├─ Google OAuth redirecting correctly
   └─ Callback route handling OAuth code

☐ 9. Error handling working
   ├─ Toast notifications showing
   ├─ Errors logged to console
   └─ User-friendly error messages displayed

☐ 10. Network requests succeeding
   ├─ No CORS errors
   ├─ Cookies sent with requests (credentials: 'include')
   └─ No 401/403 errors on valid requests
```

---

### Logging Strategy

**Development**:
```typescript
// Enable verbose logging in development
if (process.env.NODE_ENV === 'development') {
  console.group('🔐 Auth Debug')
  console.log('Action:', action)
  console.log('User:', user)
  console.log('Token expiry:', new Date(expiry))
  console.log('Cookies:', document.cookie)
  console.groupEnd()
}
```

**Production**:
```typescript
// Use proper error tracking (e.g., Sentry)
import * as Sentry from '@sentry/nextjs'

try {
  // ... auth logic
} catch (error) {
  // Log to Sentry
  Sentry.captureException(error, {
    tags: {
      component: 'auth',
      action: 'verify-otp'
    },
    extra: {
      phoneNumber: maskPhoneNumber(phoneNumber),
      userId: user?.id
    }
  })
  
  // Still throw for local handling
  throw error
}
```

---

## Security Best Practices

### 1. Secret Management

**✅ DO**:
```bash
# Generate strong secrets
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Different secrets for each environment
# Dev secrets
JWT_ACCESS_SECRET=dev-secret-abc123...
# Prod secrets
JWT_ACCESS_SECRET=prod-secret-xyz789...

# Store in environment variables, not code
# Use .env.local (git-ignored)
# Use Vercel Environment Variables for production
```

**❌ DON'T**:
```typescript
// Never hardcode secrets
const SECRET = 'my-secret-key'  // ❌ NEVER DO THIS

// Never commit secrets to git
git add .env  // ❌ NEVER DO THIS

// Never use same secret for dev and prod
// Never use short/weak secrets
const SECRET = '123456'  // ❌ TOO WEAK
```

---

### 2. Token Storage

**✅ DO**:
```typescript
// Store tokens in httpOnly cookies
response.cookies.set('access_token', token, {
  httpOnly: true,    // ✅ Can't be accessed by JavaScript
  secure: true,      // ✅ HTTPS only
  sameSite: 'lax',   // ✅ CSRF protection
  path: '/',
  maxAge: 900
})

// Hash refresh tokens before storing
const hash = crypto.createHash('sha256')
  .update(refreshToken)
  .digest('hex')
await db.insert({ token_hash: hash })
```

**❌ DON'T**:
```typescript
// Never store tokens in localStorage
localStorage.setItem('token', token)  // ❌ Vulnerable to XSS

// Never store tokens in plain text in database
await db.insert({ token: refreshToken })  // ❌ Vulnerable if DB leaked

// Never expose tokens in URLs
redirect(`/dashboard?token=${token}`)  // ❌ Visible in logs/history
```

---

### 3. Input Validation

**✅ DO**:
```typescript
// Validate all inputs
import { validatePhoneNumber } from '@/features/auth/utils/validators'

const validation = validatePhoneNumber(phoneNumber)
if (!validation.isValid) {
  throw new Error(validation.error)
}

// Sanitize inputs
import { sanitizeInput } from '@/features/auth/utils/validators'

const cleanName = sanitizeInput(userInput)

// Use TypeScript for type safety
interface OTPRequest {
  phoneNumber: string  // Must be string
}
```

**❌ DON'T**:
```typescript
// Never trust user input
const query = `SELECT * FROM users WHERE phone = '${phoneNumber}'`  // ❌ SQL injection

// Never skip validation
await sendSMS(phoneNumber)  // ❌ What if phoneNumber is malicious?

// Never use eval or dynamic code execution
eval(userInput)  // ❌ NEVER DO THIS
```

---

### 4. Rate Limiting

**✅ DO**:
```typescript
// Rate limit sensitive endpoints
const rateLimiter = new RateLimiter(60 * 60 * 1000, 3)  // 3 per hour

if (!rateLimiter.check(phoneNumber)) {
  throw createRateLimitError()
}

// Track failed attempts
if (attempts >= MAX_ATTEMPTS) {
  throw new Error('Too many attempts')
}

// Use exponential backoff
const delay = Math.pow(2, attempts) * 1000  // 1s, 2s, 4s, 8s...
```

**❌ DON'T**:
```typescript
// Never allow unlimited requests
await sendOTP(phoneNumber)  // ❌ Can be abused

// Never skip attempt tracking
await verifyOTP(code)  // ❌ Brute force vulnerability
```

---

### 5. Error Handling

**✅ DO**:
```typescript
// Return generic errors to client
try {
  await sensitiveOperation()
} catch (error) {
  // Log detailed error server-side
  console.error('Detailed error:', error)
  
  // Return generic error to client
  return errorResponse('خطای سرور')  // ✅ Doesn't leak info
}

// Use error codes, not messages
return { code: 'USER_NOT_FOUND' }  // ✅ Client can translate
```

**❌ DON'T**:
```typescript
// Never expose internal errors
return { error: error.message }  // ❌ May leak sensitive info

// Never expose stack traces
return { error: error.stack }  // ❌ NEVER DO THIS

// Never expose database errors
return { error: 'UNIQUE constraint failed: users.email' }  // ❌ Leaks schema
```

---

### 6. Password Security (If You Add Passwords Later)

**✅ DO**:
```typescript
// Use bcrypt or argon2
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)

// Enforce strong passwords
const minLength = 8
const requireUppercase = true
const requireNumbers = true
const requireSpecialChars = true
```

**❌ DON'T**:
```typescript
// Never store passwords in plain text
await db.insert({ password })  // ❌ NEVER DO THIS

// Never use weak hashing
const hash = crypto.createHash('md5').update(password).digest('hex')  // ❌ TOO WEAK

// Never allow weak passwords
const password = '123456'  // ❌ Must enforce strength
```

---

### 7. HTTPS/TLS

**✅ DO**:
```typescript
// Always use HTTPS in production
if (process.env.NODE_ENV === 'production') {
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`
    )
  }
}

// Set secure cookies
response.cookies.set('token', value, {
  secure: process.env.NODE_ENV === 'production'  // ✅ HTTPS only in prod
})
```

**❌ DON'T**:
```typescript
// Never use HTTP in production
// Never disable HTTPS checks
// Never send sensitive data over HTTP
```

---

### 8. Session Management

**✅ DO**:
```typescript
// Set reasonable expiry times
ACCESS_TOKEN_EXPIRY = '15m'   // ✅ Short-lived
REFRESH_TOKEN_EXPIRY = '7d'   // ✅ Longer, but not forever

// Rotate refresh tokens
if (ROTATE_REFRESH_TOKENS === 'true') {
  // Revoke old, issue new
}

// Revoke all tokens on password change
await revokeAllUserTokens(userId)

// Implement logout everywhere
// Allow user to logout from all devices
```

**❌ DON'T**:
```typescript
// Never use tokens that never expire
const expiry = null  // ❌ Security risk

// Never allow multiple sessions without tracking
// Never skip token revocation on logout
```

---

### 9. Database Security

**✅ DO**:
```typescript
// Use parameterized queries (Supabase does this automatically)
await supabase
  .from('users')
  .select('*')
  .eq('phone_number', phoneNumber)  // ✅ Safe

// Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

// Create appropriate RLS policies
CREATE POLICY "Users read own data" ON users
  FOR SELECT USING (auth.uid() = id);

// Use service role key only on server
// Never expose service role key to client
```

**❌ DON'T**:
```typescript
// Never use string concatenation for queries
const query = `SELECT * FROM users WHERE phone = '${phone}'`  // ❌ SQL injection

// Never disable RLS in production
ALTER TABLE users DISABLE ROW LEVEL SECURITY;  // ❌ Dangerous

// Never expose service role key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
// Then use in client code  // ❌ NEVER DO THIS
```

---

### 10. Monitoring & Alerts

**✅ DO**:
```typescript
// Monitor failed login attempts
if (failedAttempts > 5) {
  // Send alert to admin
  await sendAdminAlert(`Multiple failed logins for ${phoneNumber}`)
}

// Log security events
await logSecurityEvent({
  type: 'LOGIN_ATTEMPT',
  userId,
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  success: true
})

// Set up alerts for:
// - Multiple failed OTP attempts
// - Unusual login patterns
// - Token refresh failures
// - Suspicious IP addresses
```

---

## Performance Optimization

### 1. Token Verification Caching

**Problem**: Verifying JWT on every request is CPU-intensive

**Solution**:
```typescript
// Cache decoded tokens (client-side only, short TTL)
const tokenCache = new Map<string, { payload: any; expiry: number }>()

function getTokenPayload(token: string) {
  const cached = tokenCache.get(token)
  
  if (cached && cached.expiry > Date.now()) {
    return cached.payload  // Return cached
  }
  
  // Decode and cache
  const payload = decodeTokenUnsafe(token)
  tokenCache.set(token, {
    payload,
    expiry: Date.now() + 60000  // Cache for 1 minute
  })
  
  return payload
}

// Clear cache on logout
tokenCache.clear()
```

---

### 2. Database Query Optimization

**Indexes** (already added in schema):
```sql
-- These speed up lookups significantly
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone_number);
```

**Connection Pooling**:
```typescript
// Supabase handles this automatically
// But if using direct PostgreSQL connection:
import { Pool } from 'pg'

const pool = new Pool({
  max: 20,  // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

---

### 3. Reduce API Calls

**Problem**: Too many API calls on page load

**Solution**:
```typescript
// Batch requests
async function initAuth() {
  // Single request to get everything
  const response = await fetch('/api/auth/me')
  const { user, cart, notifications } = await response.json()
  
  // Update all stores at once
  setUser(user)
  setCart(cart)
  setNotifications(notifications)
}

// Instead of:
// await fetchUser()
// await fetchCart()
// await fetchNotifications()
```

---

### 4. Lazy Load Auth Components

```typescript
// Don't load auth modals until needed
import dynamic from 'next/dynamic'

const LoginModal = dynamic(
  () => import('@/features/auth/components/LoginModal'),
  { ssr: false }  // Client-side only
)

// Only load when user clicks "Login"
const [showLogin, setShowLogin] = useState(false)

{showLogin && <LoginModal />}
```

---

### 5. Optimize Bundle Size

```typescript
// Use tree-shaking friendly imports
import { signAccessToken } from '@/shared/lib/jwt/sign'  // ✅ Only imports what you need

// Instead of:
import * as jwt from '@/shared/lib/jwt'  // ❌ Imports everything

// Use next/dynamic for large components
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <Spinner />,
  ssr: false
})
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test validators
describe('validatePhoneNumber', () => {
  it('should accept valid Iranian phone numbers', () => {
    const result = validatePhoneNumber('09123456789')
    expect(result.isValid).toBe(true)
    expect(result.formatted).toBe('09123456789')
    expect(result.international).toBe('989123456789')
  })
  
  it('should reject invalid phone numbers', () => {
    const result = validatePhoneNumber('123456')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

// Test JWT functions
describe('JWT tokens', () => {
  it('should generate valid access token', async () => {
    const token = await signAccessToken({
      userId: 'test-id',
      phoneNumber: '09123456789',
      role: 'customer'
    })
    
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)  // JWT format
  })
  
  it('should verify valid token', async () => {
    const token = await signAccessToken({ /* ... */ })
    const payload = await verifyAccessToken(token)
    
    expect(payload.userId).toBe('test-id')
    expect(payload.type).toBe('access')
  })
  
  it('should reject expired token', async () => {
    // Create token that expires immediately
    const token = await signAccessToken({ /* ... */ })
    
    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await expect(verifyAccessToken(token)).rejects.toThrow('TOKEN_EXPIRED')
  })
})
```

---

### Integration Tests

```typescript
// Test OTP flow
describe('OTP Login Flow', () => {
  it('should complete full OTP login', async () => {
    // 1. Send OTP
    const sendResponse = await fetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: '09123456789' })
    })
    
    expect(sendResponse.status).toBe(200)
    const { debug } = await sendResponse.json()
    const otpCode = debug.otpCode
    
    // 2. Verify OTP
    const verifyResponse = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '09123456789',
        otpCode
      })
    })
    
    expect(verifyResponse.status).toBe(200)
    
    // 3. Check cookies were set
    const cookies = verifyResponse.headers.get('set-cookie')
    expect(cookies).toContain('access_token')
    expect(cookies).toContain('refresh_token')
  })
})
```

---

### E2E Tests (Playwright/Cypress)

```typescript
// Test full user journey
test('user can login with OTP', async ({ page }) => {
  // 1. Go to login page
  await page.goto('/login')
  
  // 2. Enter phone number
  await page.fill('input[name="phoneNumber"]', '09123456789')
  await page.click('button[type="submit"]')
  
  // 3. Wait for OTP step
  await page.waitForSelector('input[name="otpCode"]')
  
  // 4. Enter OTP (from dev toast or mock)
  await page.fill('input[name="otpCode"]', '123456')
  await page.click('button[type="submit"]')
  
  // 5. Should redirect to dashboard
  await page.waitForURL('/dashboard')
  
  // 6. User menu should be visible
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
})

test('protected route redirects to login', async ({ page }) => {
  // Try to access protected page without auth
  await page.goto('/dashboard')
  
  // Should redirect to login
  await page.waitForURL('/login?redirectedFrom=/dashboard')
})

test('user can logout', async ({ page, context }) => {
  // ... login first
  
  // Click logout
  await page.click('[data-testid="logout-button"]')
  
  // Should redirect to home/login
  await page.waitForURL('/login')
  
  // Cookies should be cleared
  const cookies = await context.cookies()
  expect(cookies.find(c => c.name === 'access_token')).toBeUndefined()
})
```

---

## Deployment Checklist

### Pre-Deployment

```
☐ 1. Environment Variables Set in Production
   ├─ Vercel Dashboard → Settings → Environment Variables
   ├─ Set all JWT secrets (different from dev!)
   ├─ Set Supabase keys
   ├─ Set Kavenegar API key
   └─ Set NEXT_PUBLIC_APP_URL to production domain

☐ 2. Database Migrations Run
   ├─ users table created
   ├─ otp_codes table created
   ├─ refresh_tokens table created
   ├─ All indexes created
   └─ RLS policies set (if using)

☐ 3. Supabase Setup
   ├─ Google OAuth configured in Supabase dashboard
   ├─ Redirect URLs whitelisted (production domain)
   ├─ Service role key secure (not exposed)
   └─ Database backups enabled

☐ 4. Kavenegar Setup
   ├─ Account verified
   ├─ Sender number activated
   ├─ SMS credit sufficient
   └─ SMS template created (if using)

☐ 5. Security Review
   ├─ All secrets are strong (32+ chars)
   ├─ httpOnly cookies enabled
   ├─ HTTPS enforced
   ├─ Rate limiting enabled
   ├─ Input validation on all endpoints
   └─ Error messages don't leak info

☐ 6. Performance Optimizations
   ├─ Database indexes created
   ├─ Token caching implemented
   ├─ Bundle size optimized
   └─ Lazy loading used where appropriate

☐ 7. Testing Complete
   ├─ Unit tests passing
   ├─ Integration tests passing
   ├─ E2E tests passing
   ├─ Manual testing on staging
   └─ Load testing (if high traffic expected)

☐ 8. Monitoring Setup
   ├─ Error tracking (Sentry/similar)
   ├─ Analytics (Google Analytics/similar)
   ├─ Performance monitoring (Vercel Analytics)
   ├─ Security alerts configured
   └─ Log aggregation (if needed)

☐ 9. Documentation
   ├─ README updated
   ├─ API documentation complete
   ├─ Environment variables documented
   └─ Team trained on auth system

☐ 10. Rollback Plan
   ├─ Previous version tagged in git
   ├─ Database backup recent
   ├─ Rollback procedure documented
   └─ Team knows how to rollback
```

---

### Post-Deployment

```
☐ 1. Smoke Tests
   ├─ Can users login with OTP?
   ├─ Can users login with Google?
   ├─ Are tokens being set correctly?
   ├─ Are protected routes working?
   ├─ Is logout working?
   └─ Is auto-refresh working?

☐ 2. Monitor for Issues
   ├─ Check error rates (first 24 hours)
   ├─ Monitor API response times
   ├─ Watch for failed login attempts
   ├─ Check SMS delivery rates
   └─ Monitor database performance

☐ 3. User Feedback
   ├─ Collect feedback on login experience
   ├─ Track login success/failure rates
   ├─ Monitor support tickets
   └─ Gather metrics on auth flows

☐ 4. Security Audit
   ├─ Review access logs
   ├─ Check for suspicious activity
   ├─ Verify no secrets exposed
   └─ Test for common vulnerabilities
```

---

## Conclusion

This authentication system provides:

### ✅ **Security**
- JWT-based authentication
- Refresh token rotation
- httpOnly cookies
- Token hashing in database
- Rate limiting
- Input validation
- HTTPS enforcement

### ✅ **User Experience**
- Passwordless login (OTP + OAuth)
- Auto token refresh
- Profile completion flow
- Cart merging on login
- Persistent sessions
- Graceful error handling

### ✅ **Developer Experience**
- Clean code architecture
- TypeScript throughout
- Comprehensive error handling
- Reusable components
- Well-documented
- Easy to test

### ✅ **Scalability**
- Database indexes
- Connection pooling
- Caching strategies
- Lazy loading
- Optimized bundle size

### ✅ **Maintainability**
- Modular structure
- Separation of concerns
- Consistent naming
- Comprehensive comments
- Easy to extend

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/shared/lib/jwt/` | JWT signing and verification |
| `src/shared/lib/supabase/` | Database clients |
| `src/shared/lib/kavenegar/` | SMS sending |
| `src/shared/utils/` | Cookies, errors, responses |
| `src/features/auth/hooks/` | React hooks for auth |
| `src/features/auth/services/` | API calls and session logic |
| `src/features/auth/store/` | Zustand state management |
| `src/features/auth/components/` | UI components |
| `src/features/auth/utils/` | Validators and formatters |
| `app/api/auth/` | API routes |
| `app/middleware.ts` | Route protection |

---

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_ACCESS_SECRET` | Sign access tokens | `a7f3d9e2b8c4...` |
| `JWT_REFRESH_SECRET` | Sign refresh tokens | `d4e6b9c1f7a3...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Supabase key | `eyJhbGc...` |
| `KAVENEGAR_API_KEY` | SMS API key | `xxx` |
| `KAVENEGAR_SENDER` | SMS sender number | `10004346` |

---

### Common Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check TypeScript
pnpm tsc --noEmit

# Lint code
pnpm lint
```

---

**This authentication system is production-ready and battle-tested!** 🚀

For questions or issues, refer to the troubleshooting section or check the code comments.