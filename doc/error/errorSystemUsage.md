# 🚨 Global Error System - Usage Guide

## Overview

This error system provides a consistent, type-safe way to handle errors across your entire application - from backend API routes to frontend components.

## Key Features

✅ **Centralized Error Codes** - All error types defined in one place  
✅ **Type-Safe** - Full TypeScript support with custom AppError class  
✅ **Automatic Logging** - Server-side errors logged with context  
✅ **Persian Messages** - User-friendly error messages in Persian  
✅ **HTTP Integration** - Automatic status code mapping  
✅ **Client Toasts** - Built-in toast notifications for frontend  

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           Application Layer                  │
│  (Components, API Routes, Services)          │
└──────────────┬──────────────────────────────┘
               │
               │ throws AppError
               │
┌──────────────▼──────────────────────────────┐
│         Error Handling Layer                 │
│  - handleAPIRouteError()                     │
│  - showErrorToast()                          │
│  - logError()                                │
└──────────────┬──────────────────────────────┘
               │
               │ formats response
               │
┌──────────────▼──────────────────────────────┐
│           Response Layer                     │
│  - errorResponse()                           │
│  - successResponse()                         │
└─────────────────────────────────────────────┘
```

---

## Error Codes Organization

| Range | Category | HTTP Status |
|-------|----------|-------------|
| 1xxx  | Authentication | 401 |
| 2xxx  | OTP | 400 |
| 3xxx  | User | 400/404 |
| 4xxx  | Validation | 400 |
| 5xxx  | Server | 500 |
| 6xxx  | Rate Limiting | 429 |
| 7xxx  | Token | 401 |

---

## Backend Usage (API Routes)

### Basic Pattern

```typescript
import { handleAPIRouteError } from '@/shared/utils/response'
import { createValidationError } from '@/shared/utils/errors'

export async function POST(request: NextRequest) {
  try {
    // Your logic here
    const body = await request.json()
    
    if (!body.phoneNumber) {
      throw createValidationError('شماره موبایل الزامی است')
    }
    
    // ... rest of logic
    
    return successResponse({ success: true })
  } catch (error) {
    return handleAPIRouteError(error, 'API Context Name')
  }
}
```

### Error Factory Functions

Use these instead of throwing generic errors:

```typescript
// Auth errors
throw createUnauthorizedError()
throw createTokenExpiredError()
throw createInvalidTokenError()
throw createMissingTokenError()

// OTP errors
throw createOTPExpiredError()
throw createOTPInvalidError()
throw createOTPMaxAttemptsError()

// Validation errors
throw createValidationError('Custom message', { details })

// Server errors
throw createServerError()
throw createDatabaseError('DB error', { query })
throw createExternalAPIError('API failed', { service: 'Kavenegar' })

// Rate limiting
throw createRateLimitError()

// User errors
throw createUserNotFoundError()
throw createNotFoundError('Resource not found')
```

### Why Use Factory Functions?

✅ Consistent error codes  
✅ Automatic status codes  
✅ Type safety  
✅ Easier refactoring  
✅ Better IDE autocomplete  

---

## Frontend Usage (React Components)

### With React Query

```typescript
import { useMutation } from '@tanstack/react-query'
import { showErrorToast, showSuccessToast } from '@/shared/utils/errors'

const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  },
  onSuccess: () => {
    showSuccessToast('کد تایید ارسال شد')
  },
  onError: (error) => {
    showErrorToast(error)
  },
})
```

### Manual Error Handling

```typescript
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '@/shared/utils/errors'

async function handleSubmit() {
  const toastId = showLoadingToast('در حال ارسال...')
  
  try {
    const response = await fetch('/api/endpoint', { ... })
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    dismissToast(toastId)
    showSuccessToast('عملیات موفق بود')
  } catch (error) {
    dismissToast(toastId)
    showErrorToast(error, 'خطا در انجام عملیات')
  }
}
```

---

## JWT Verification Integration

The JWT verify functions now throw AppError:

```typescript
import { verifyAccessToken } from '@/shared/lib/jwt/verify'

// In API route
try {
  const payload = await verifyAccessToken(token)
  // Token is valid, use payload
} catch (error) {
  // Error is AppError with proper code
  // Will be caught by handleAPIRouteError
  throw error
}
```

Possible errors thrown:
- `createMissingTokenError()` - No token provided
- `createTokenExpiredError()` - Token expired
- `createInvalidSignatureError()` - Invalid signature
- `createInvalidTokenTypeError()` - Wrong token type
- `createInvalidTokenError()` - Generic invalid token

---

## Response Utilities

### Success Responses

```typescript
import { successResponse, createdResponse } from '@/shared/utils/response'

// 200 OK
return successResponse({ user }, 'ورود موفق')

// 201 Created
return createdResponse({ user }, 'کاربر ایجاد شد')
```

### Error Responses

```typescript
import { 
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  rateLimitError,
  serverError,
} from '@/shared/utils/response'

// Use specific helpers
return validationError('شماره موبایل نامعتبر است')
return unauthorizedError()
return rateLimitError()

// Or use generic errorResponse
return errorResponse(error)
```

---

## Error Logging

Automatic logging happens in:
1. `handleAPIRouteError()` - API route errors
2. `verifyAccessToken()` / `verifyRefreshToken()` - JWT errors
3. Any thrown AppError

Manual logging:

```typescript
import { logError } from '@/shared/utils/errors'

try {
  // risky operation
} catch (error) {
  logError(error, 'Custom Context')
  throw error
}
```

Log output includes:
- Error message
- Error code (if AppError)
- Status code
- Details
- Stack trace
- Timestamp
- Context

---

## Custom Error Example

Need a new error type?

1. **Add error code to enum:**
```typescript
export enum ErrorCode {
  // ... existing codes
  PAYMENT_FAILED = 8001,
}
```

2. **Add Persian message:**
```typescript
export const ErrorMessages: Record<ErrorCode, string> = {
  // ... existing messages
  [ErrorCode.PAYMENT_FAILED]: 'پرداخت ناموفق بود',
}
```

3. **Create factory function:**
```typescript
export function createPaymentFailedError(message?: string, details?: any): AppError {
  return new AppError(
    ErrorCode.PAYMENT_FAILED,
    message || getErrorMessage(ErrorCode.PAYMENT_FAILED),
    400,
    details
  )
}
```

4. **Use it:**
```typescript
throw createPaymentFailedError('تراکنش ناموفق بود', { transactionId })
```

---

## Best Practices

### ✅ DO

- Use factory functions instead of `new AppError()`
- Always wrap API routes with `try-catch` and `handleAPIRouteError()`
- Provide context to `logError()` and `handleAPIRouteError()`
- Use specific error types (not generic)
- Include helpful details for debugging
- Show user-friendly Persian messages

### ❌ DON'T

- Don't throw generic `Error` objects
- Don't create AppError directly (use factories)
- Don't ignore errors silently
- Don't expose sensitive info in error messages
- Don't use English error messages for users
- Don't forget to await async error handlers

---

## Error Flow Diagram

```
┌──────────────┐
│ API Request  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Validation   │──✗──▶ throw createValidationError()
└──────┬───────┘
       │ ✓
       ▼
┌──────────────┐
│ Business     │──✗──▶ throw createOTPExpiredError()
│ Logic        │
└──────┬───────┘
       │ ✓
       ▼
┌──────────────┐
│ Database     │──✗──▶ throw createDatabaseError()
└──────┬───────┘
       │ ✓
       ▼
┌──────────────┐
│ Success      │
│ Response     │
└──────────────┘
       │
       │ All errors caught by:
       ▼
┌──────────────────────┐
│ handleAPIRouteError  │
│ - Logs error         │
│ - Returns response   │
└──────────────────────┘
```

---

## Next Steps

Now that you have the error system in place:

1. ✅ Update all API routes to use `handleAPIRouteError`
2. ✅ Replace generic errors with factory functions
3. ✅ Add toast notifications to frontend mutations
4. ✅ Test error flows (expired tokens, invalid OTP, etc.)
5. ✅ Add monitoring for production errors

---

## Need Help?

Common issues:

**Q: How do I create a custom error?**  
A: Follow the "Custom Error Example" section above

**Q: Error not showing in frontend?**  
A: Check that you're using `showErrorToast()` in your error handler

**Q: Want different message than default?**  
A: Pass custom message to factory function: `createOTPExpiredError('Custom message')`

**Q: Need to add extra data to error?**  
A: Use the `details` parameter: `createDatabaseError('Failed', { query, table })`