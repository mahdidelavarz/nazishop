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
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Login Form   │  │  UserMenu    │  │ Protected    │          │
│  │ (OTP/OAuth)  │  │  Component   │  │ Routes       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │ Auth Hooks  │                              │
│                    │ useAuth()   │                              │
│                    │ useOTPLogin │                              │
│                    └──────┬──────┘                              │
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
│  └───────────────