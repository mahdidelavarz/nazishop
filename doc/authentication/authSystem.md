# 📚 Complete Authentication System Documentation

A comprehensive guide to understanding the architecture, flow, and implementation of the JWT-based authentication system.

---

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Authentication Flow](#authentication-flow)
- [Component Hierarchy](#component-hierarchy)
- [Core Components](#core-components)
- [Custom Hooks](#custom-hooks)
- [API Routes](#api-routes)
- [State Management](#state-management)
- [Utilities & Libraries](#utilities--libraries)
- [Token Management](#token-management)
- [Request Flow](#request-flow)
- [Error Handling](#error-handling)
- [Security Layers](#security-layers)

---

## 🏗 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Pages      │─────▶│  Components  │                   │
│  │  (Routes)    │      │   (UI Layer) │                   │
│  └──────┬───────┘      └──────┬───────┘                   │
│         │                     │                             │
│         └─────────┬───────────┘                            │
│                   │                                         │
│         ┌─────────▼──────────┐                             │
│         │   Custom Hooks     │                             │
│         │  (Business Logic)  │                             │
│         └─────────┬──────────┘                             │
│                   │                                         │
│         ┌─────────▼──────────┐      ┌──────────────┐      │
│         │   Zustand Store    │◀────▶│  API Client  │      │
│         │  (Global State)    │      │  (Axios)     │      │
│         └────────────────────┘      └──────┬───────┘      │
│                                             │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                    ┌─────────────────────────▼─────┐
                    │      Middleware (Edge)        │
                    │   (Token Validation)          │
                    └─────────────────────────────┬─┘
                                                  │
┌─────────────────────────────────────────────────▼─────────┐
│                      SERVER SIDE                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │  API Routes  │─────▶│  JWT Utils   │                 │
│  │  (Handlers)  │      │  (lib/jwt)   │                 │
│  └──────┬───────┘      └──────────────┘                 │
│         │                                                 │
│         │              ┌──────────────┐                  │
│         └─────────────▶│  Supabase    │                  │
│                        │  (Database)  │                  │
│                        └──────┬───────┘                  │
│                               │                           │
│                        ┌──────▼───────┐                  │
│                        │  Kavenegar   │                  │
│                        │  (SMS)       │                  │
│                        └──────────────┘                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

### Complete User Journey

```
┌──────────────────────────────────────────────────────────────┐
│                    1. INITIAL VISIT                          │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  User visits    │
                    │  /login page    │
                    └────────┬────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    2. OTP REQUEST                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Component: OTPForm.tsx                                     │
│  ┌────────────────────────────────────────┐                │
│  │ User enters phone: 09123456789         │                │
│  │ Clicks "ارسال کد تایید"                │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               │ useMutation (React Query)                   │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ POST /api/auth/send-otp                │                │
│  │ Body: { phone_number }                 │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Server Side (send-otp/route.ts):                          │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Validate phone format               │                │
│  │ 2. Check rate limit (1/min)            │                │
│  │ 3. Generate 4-digit OTP                │                │
│  │ 4. Save to otp_codes table             │                │
│  │ 5. Send SMS via Kavenegar              │                │
│  │ 6. Return success + OTP (dev mode)     │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ OTP shown in toast (dev mode)          │                │
│  │ Switch to VerifyOTPForm                │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    3. OTP VERIFICATION                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Component: VerifyOTPForm.tsx                               │
│  ┌────────────────────────────────────────┐                │
│  │ User enters OTP: 1234                  │                │
│  │ 2-minute countdown timer               │                │
│  │ Clicks "تایید و ورود"                  │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               │ useMutation (React Query)                   │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ POST /api/auth/verify-otp              │                │
│  │ Body: { phone_number, otp_code }       │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Server Side (verify-otp/route.ts):                        │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Find OTP in database                │                │
│  │ 2. Check expiration (2 min)            │                │
│  │ 3. Check attempts (max 5)              │                │
│  │ 4. Verify OTP code                     │                │
│  │ 5. Mark OTP as verified                │                │
│  │ 6. Check if user exists                │                │
│  │    ├─ YES: Get user data               │                │
│  │    └─ NO: Create new user              │                │
│  │ 7. Generate JWT tokens                 │                │
│  │    ├─ Access Token (15 min)            │                │
│  │    └─ Refresh Token (7 days)           │                │
│  │ 8. Hash & save refresh token           │                │
│  │ 9. Log login to loginlog               │                │
│  │ 10. Set access token in cookie         │                │
│  │ 11. Return user + refreshToken         │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Client Side (VerifyOTPForm.tsx):                          │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Save user to Zustand                │                │
│  │ 2. Save refreshToken to Zustand        │                │
│  │ 3. Access token auto in cookie         │                │
│  │ 4. Redirect to /profile                │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    4. PROFILE PAGE                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Hook: useProtectedRoute()                                  │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Check authentication                │                │
│  │ 2. Initialize user data                │                │
│  │ 3. Redirect if not authenticated       │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Check: profile_completed?                                  │
│  ┌────────────────────────────────────────┐                │
│  │ NO → Show CompleteProfileForm          │                │
│  │ YES → Show Profile Details             │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  If NO (New User):                                          │
│  Component: CompleteProfileForm.tsx                         │
│  ┌────────────────────────────────────────┐                │
│  │ User enters:                           │                │
│  │ - Full Name (required)                 │                │
│  │ - Address (required)                   │                │
│  │ - Postal Code (optional)               │                │
│  │ - Birthday (optional)                  │                │
│  │ Clicks "ذخیره اطلاعات"                 │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               │ useMutation (React Query)                   │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ POST /api/profile/complete             │                │
│  │ Body: { full_name, address, ... }      │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Server Side (complete/route.ts):                          │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Verify access token from cookie     │                │
│  │ 2. Validate required fields            │                │
│  │ 3. Update user in database             │                │
│  │ 4. Set profile_completed = true        │                │
│  │ 5. Return updated user                 │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Update user in Zustand              │                │
│  │ 2. Redirect to home page               │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    5. HOME PAGE                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Page: page.tsx (Public)                                    │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Check if user logged in             │                │
│  │ 2. Show personalized content           │                │
│  │ 3. Display user name in header         │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  Header Component:                                          │
│  ┌────────────────────────────────────────┐                │
│  │ If authenticated:                      │                │
│  │ - Show user name                       │                │
│  │ - Show logout button                   │                │
│  │ If not authenticated:                  │                │
│  │ - Show login button                    │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                 6. TOKEN REFRESH (Automatic)                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Trigger: Any API request after 15 minutes                  │
│  ┌────────────────────────────────────────┐                │
│  │ User clicks anything                   │                │
│  │ (e.g., view profile)                   │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               │ apiClient (Axios)                           │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ GET /api/auth/me                       │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Access Token Expired?                                      │
│  ┌────────────────────────────────────────┐                │
│  │ Server returns 401 Unauthorized        │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Axios Interceptor (api-client.ts):                        │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Catch 401 error                     │                │
│  │ 2. Get refreshToken from Zustand       │                │
│  │ 3. Call POST /api/auth/refresh         │                │
│  │ 4. Queue other pending requests        │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Server Side (refresh/route.ts):                           │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Verify refresh token                │                │
│  │ 2. Check if token in database          │                │
│  │ 3. Check if not revoked                │                │
│  │ 4. Compare token hash                  │                │
│  │ 5. Generate new access token           │                │
│  │ 6. Set in httpOnly cookie              │                │
│  │ 7. Return success                      │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ 1. New access token in cookie          │                │
│  │ 2. Retry original request (GET /me)    │                │
│  │ 3. Return user data                    │                │
│  │ 4. User never noticed!                 │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    7. LOGOUT                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Component: Header.tsx                                      │
│  ┌────────────────────────────────────────┐                │
│  │ User clicks "خروج" button              │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               │ useAuth().logout()                          │
│               ▼                                              │
│  ┌────────────────────────────────────────┐                │
│  │ POST /api/auth/logout                  │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Server Side (logout/route.ts):                            │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Get access token from cookie        │                │
│  │ 2. Verify token                        │                │
│  │ 3. Revoke all user refresh tokens      │                │
│  │ 4. Clear access token cookie           │                │
│  │ 5. Return success                      │                │
│  └────────────┬───────────────────────────┘                │
│               │                                              │
│               ▼                                              │
│  Client Side (useAuth hook):                               │
│  ┌────────────────────────────────────────┐                │
│  │ 1. Clear Zustand store                 │                │
│  │ 2. Clear React Query cache             │                │
│  │ 3. Redirect to /login                  │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Hierarchy

### Visual Component Tree

```
App (layout.tsx)
│
├─ Providers (providers.tsx)
│  └─ QueryClientProvider (React Query)
│
├─ Header (Header.tsx)
│  ├─ useAuth() ─────────────────┐
│  └─ Navigation Links            │
│                                 │
└─ Main Content                   │
   │                              │
   ├─ Page: / (Home - Public)    │
   │  └─ useAuth() ──────────────┤
   │                              │
   ├─ Page: /login               │
   │  ├─ OTPForm ─────────────┐  │
   │  │  └─ useMutation       │  │
   │  │     (send-otp)        │  │
   │  │                       │  │
   │  └─ VerifyOTPForm        │  │
   │     ├─ useMutation ──────┤  │
   │     │  (verify-otp)      │  │
   │     └─ useAuthStore ─────┼──┤
   │                          │  │
   └─ Page: /profile          │  │
      ├─ useProtectedRoute ───┼──┤
      │  └─ useAuth() ─────────┘  │
      │                            │
      ├─ CompleteProfileForm       │
      │  ├─ useMutation ───────────┤
      │  │  (complete-profile)     │
      │  └─ useAuthStore ──────────┤
      │                            │
      └─ Profile Display          │
         └─ User Data from Store ─┘

Shared State:
┌─────────────────────┐
│   Zustand Store     │ ← All components access
│  (auth.store.ts)    │    this for user data
│                     │    and refresh token
│  - user             │
│  - refreshToken     │
│  - isAuthenticated  │
└─────────────────────┘
```

---

## 🎨 Core Components

### 1. **OTPForm.tsx**

**Purpose:** Collects phone number and requests OTP

**Location:** `src/components/auth/OTPForm.tsx`

**Props:**
```typescript
interface OTPFormProps {
  onSuccess: (phoneNumber: string) => void;
}
```

**Flow:**
```
User Input → Validation → API Call → SMS Sent → Callback
```

**Key Features:**
- Iranian phone format validation (09xxxxxxxxx)
- React Query mutation for API call
- Loading state management
- Toast notifications
- Passes phone number to parent on success

**Dependencies:**
- `useMutation` from React Query
- `axios` for HTTP
- `toast` from react-hot-toast
- `Icon` from @iconify/react

**Example Usage:**
```typescript
<OTPForm onSuccess={(phone) => {
  setPhoneNumber(phone);
  setStep('verify');
}} />
```

---

### 2. **VerifyOTPForm.tsx**

**Purpose:** Verifies OTP code and completes authentication

**Location:** `src/components/auth/VerifyOTPForm.tsx`

**Props:**
```typescript
interface VerifyOTPFormProps {
  phoneNumber: string;
  onBack: () => void;
}
```

**Flow:**
```
OTP Input → Validation → API Call → Save Tokens → Redirect
```

**Key Features:**
- 4-digit OTP input
- 2-minute countdown timer
- Retry mechanism (back button)
- React Query mutation
- Zustand state updates
- Automatic redirect based on profile status

**Dependencies:**
- `useMutation` from React Query
- `useRouter` from Next.js
- `useAuthStore` from Zustand
- `axios` for HTTP

**State Updates:**
```typescript
// On success:
setUser(data.user);              // Save user to Zustand
setRefreshToken(data.refreshToken); // Save refresh token
router.push('/profile');          // Redirect
```

**Example Usage:**
```typescript
<VerifyOTPForm 
  phoneNumber="09123456789"
  onBack={() => setStep('phone')}
/>
```

---

### 3. **CompleteProfileForm.tsx**

**Purpose:** Collects additional user information

**Location:** `src/components/profile/CompleteProfileForm.tsx`

**Props:** None (uses internal state)

**Flow:**
```
Form Input → Validation → API Call → Update Store → Redirect
```

**Form Fields:**
```typescript
{
  full_name: string;    // Required
  address: string;      // Required
  postal_code: string;  // Optional
  birthday: string;     // Optional (date)
}
```

**Key Features:**
- Controlled form with React state
- Required field validation
- React Query mutation with apiClient (uses access token)
- Updates Zustand store with complete user
- Redirects to home page

**Dependencies:**
- `apiClient` (automatic token refresh)
- `useAuthStore` from Zustand
- `useRouter` from Next.js

**Example Usage:**
```typescript
{!user.profile_completed && (
  <CompleteProfileForm />
)}
```

---

### 4. **Header.tsx**

**Purpose:** Navigation bar with authentication status

**Location:** `src/components/layout/Header.tsx`

**Props:** None

**Flow:**
```
Check Auth → Display User Info / Login Button
```

**Key Features:**
- Shows user name when authenticated
- Logout button
- Login button for guests
- Navigation links
- Responsive design

**Dependencies:**
- `useAuth` hook
- `Link` from Next.js

**Conditional Rendering:**
```typescript
{isAuthenticated ? (
  <>
    <span>{user.full_name || user.phone_number}</span>
    <button onClick={logout}>خروج</button>
  </>
) : (
  <Link href="/login">ورود</Link>
)}
```

---

## 🪝 Custom Hooks

### 1. **useAuth()**

**Purpose:** Main authentication operations hook

**Location:** `src/hooks/useAuth.ts`

**Returns:**
```typescript
{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initializeUser: () => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setRefreshToken: (token: string | null) => void;
}
```

**Key Functions:**

#### `initializeUser()`
```typescript
// Fetches current user from /api/auth/me
// Called on page mount to restore session
const initializeUser = async () => {
  const result = await refetch();
  if (result.data) {
    setUser(result.data);
  } else {
    clearAuth();
  }
};
```

#### `logout()`
```typescript
// Calls logout API, clears state, redirects
const logout = () => {
  logoutMutation.mutate();
  // -> POST /api/auth/logout
  // -> clearAuth()
  // -> router.push('/login')
};
```

**Usage Example:**
```typescript
function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <header>
      {isAuthenticated && (
        <>
          <span>{user?.full_name}</span>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </header>
  );
}
```

**Dependencies:**
- `useQuery` from React Query
- `useMutation` from React Query
- `useAuthStore` from Zustand
- `apiClient` for HTTP

---

### 2. **useProtectedRoute()**

**Purpose:** Protects routes from unauthorized access

**Location:** `src/hooks/useProtectedRoute.ts`

**Returns:**
```typescript
{
  user: User | null;
  isLoading: boolean;
}
```

**Flow:**
```
Mount → Initialize User → Check Auth → Redirect if needed
```

**Implementation:**
```typescript
export function useProtectedRoute() {
  const router = useRouter();
  const { user, isLoading, initializeUser } = useAuth();

  // Initialize on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
```

**Usage Example:**
```typescript
function ProfilePage() {
  const { user, isLoading } = useProtectedRoute();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    return null; // Will redirect
  }
  
  return <Profile user={user} />;
}
```

**Protection Flow:**
```
Page Mount
    ↓
useProtectedRoute()
    ↓
initializeUser()
    ↓
GET /api/auth/me
    ↓
User exists?
├─ YES → Render page
└─ NO → Redirect to /login
```

---

## 🔌 API Routes

### 1. **POST /api/auth/send-otp**

**Purpose:** Generate and send OTP via SMS

**Location:** `src/app/api/auth/send-otp/route.ts`

**Request:**
```typescript
{
  phone_number: string; // "09123456789"
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  otpCode?: string; // Development only
}
```

**Process Flow:**
```
1. Validate phone format (09xxxxxxxxx)
2. Check rate limit (1 OTP per minute per phone)
3. Generate random 4-digit code
4. Calculate expiration (now + 2 minutes)
5. Save to otp_codes table
6. Send SMS via Kavenegar
7. Return success (+ OTP in dev mode)
```

**Database Operation:**
```typescript
await supabaseAdmin.from('otp_codes').insert({
  phone_number,
  otp_code: otpCode,
  expires_at: expiresAt.toISOString(),
  verified: false,
  attempts: 0,
});
```

**Rate Limiting:**
```typescript
const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
const { data: recentOTP } = await supabaseAdmin
  .from('otp_codes')
  .select('*')
  .eq('phone_number', phone_number)
  .gte('created_at', oneMinuteAgo)
  .single();

if (recentOTP) {
  return 429 Error;
}
```

---

### 2. **POST /api/auth/verify-otp**

**Purpose:** Verify OTP and create/login user

**Location:** `src/app/api/auth/verify-otp/route.ts`

**Request:**
```typescript
{
  phone_number: string;
  otp_code: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: User;
  refreshToken: string;
  requiresProfileCompletion: boolean;
}
```

**Process Flow:**
```
1. Find latest unverified OTP for phone
2. Check expiration (2 minutes)
3. Check attempts (max 5)
4. Verify OTP code matches
5. Mark OTP as verified
6. Check if user exists
   ├─ YES: Get user data
   └─ NO: Create new user
7. Generate JWT tokens
   ├─ Access Token (15 min)
   └─ Refresh Token (7 days)
8. Hash refresh token with bcrypt
9. Save hashed token to refresh_tokens table
10. Log login to loginlog table
11. Set access token in httpOnly cookie
12. Return user + refreshToken
```