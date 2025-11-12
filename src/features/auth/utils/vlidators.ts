// src/features/auth/utils/validators.ts

import { PhoneValidationResult, EmailValidationResult } from '../types/authType'

/**
 * Iranian Phone Number Regex
 * Format: 09XXXXXXXXX (11 digits starting with 09)
 */
const IRANIAN_PHONE_REGEX = /^09[0-9]{9}$/

/**
 * Email Regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Validate Iranian phone number
 * @param phone - Phone number to validate
 * @returns Validation result with formatted versions
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')

  // Check format
  if (!IRANIAN_PHONE_REGEX.test(cleaned)) {
    return {
      isValid: false,
      error: 'فرمت شماره موبایل باید 09XXXXXXXXX باشد',
    }
  }

  // Convert to international format (98XXXXXXXXX)
  const international = '98' + cleaned.slice(1)

  return {
    isValid: true,
    formatted: cleaned, // 09XXXXXXXXX
    international, // 98XXXXXXXXX
  }
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): EmailValidationResult {
  // Trim whitespace
  const trimmed = email.trim()

  // Check if empty
  if (!trimmed) {
    return {
      isValid: false,
      error: 'ایمیل نمی‌تواند خالی باشد',
    }
  }

  // Check format
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'فرمت ایمیل نامعتبر است',
    }
  }

  // Check length
  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'ایمیل بیش از حد طولانی است',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate OTP code
 * @param code - OTP code to validate
 * @returns true if valid
 */
export function validateOTPCode(code: string): boolean {
  return /^[0-9]{6}$/.test(code)
}

/**
 * Validate full name
 * @param name - Name to validate
 * @returns Validation result
 */
export function validateFullName(name: string): {
  isValid: boolean
  error?: string
} {
  const trimmed = name.trim()

  if (!trimmed) {
    return {
      isValid: false,
      error: 'نام نمی‌تواند خالی باشد',
    }
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'نام باید حداقل ۳ کاراکتر باشد',
    }
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'نام بیش از حد طولانی است',
    }
  }

  // Check for invalid characters (only letters, spaces, and Persian characters)
  const validNameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/
  if (!validNameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'نام فقط می‌تواند شامل حروف باشد',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate password strength (if you add password auth later)
 * @param password - Password to validate
 * @returns Validation result with strength score
 */
export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  error?: string
} {
  if (!password) {
    return {
      isValid: false,
      strength: 'weak',
      error: 'رمز عبور نمی‌تواند خالی باشد',
    }
  }

  if (password.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      error: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
    }
  }

  // Check strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score >= 5) strength = 'strong'
  else if (score >= 3) strength = 'medium'

  return {
    isValid: score >= 3,
    strength,
    error: score < 3 ? 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد' : undefined,
  }
}

/**
 * Sanitize input string
 * Removes dangerous characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

/**
 * Check if string contains only Persian characters
 */
export function isPersian(text: string): boolean {
  return /^[\u0600-\u06FF\s]+$/.test(text)
}

/**
 * Check if string contains only English characters
 */
export function isEnglish(text: string): boolean {
  return /^[a-zA-Z\s]+$/.test(text)
}