// src/features/auth/utils/validators.ts

import {
  PhoneValidationResult,
  EmailValidationResult,
  OTPValidationResult,
} from '../types/authType'

/**
 * Iranian Phone Number Regex
 * Format: 09XXXXXXXXX (11 digits starting with 09)
 * Valid operator codes: 901-905, 910-921, 930-939, 990-994
 */
const IRANIAN_PHONE_REGEX = /^09(0[1-5]|1[0-9]|2[0-1]|3[0-9]|9[0-4])[0-9]{7}$/

/**
 * Email Regex (RFC 5322 simplified but more strict)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Iranian Postal Code Regex
 * Format: XXXXXXXXXX (10 digits)
 */
const IRANIAN_POSTAL_CODE_REGEX = /^[0-9]{10}$/

/**
 * OTP Code Regex
 * Format: 6 digits
 */
const OTP_CODE_REGEX = /^[0-9]{6}$/

/**
 * Validate Iranian phone number
 * @param phone - Phone number to validate
 * @returns Validation result with formatted versions
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  // Handle empty input
  if (!phone) {
    return {
      isValid: false,
      error: 'شماره موبایل نمی‌تواند خالی باشد',
    }
  }

  // Remove spaces, dashes, and Persian/Arabic digits
  let cleaned = phone.replace(/[\s\-()]/g, '')

  // Normalize Persian/Arabic digits to English
  cleaned = normalizePersianNumbers(cleaned)

  // Remove +98 or 0098 prefix if present
  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3)
  } else if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4)
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2)
  }

  // Check length
  if (cleaned.length !== 11) {
    return {
      isValid: false,
      error: 'شماره موبایل باید ۱۱ رقم باشد',
    }
  }

  // Check format and operator code
  if (!IRANIAN_PHONE_REGEX.test(cleaned)) {
    return {
      isValid: false,
      error: 'فرمت شماره موبایل نامعتبر است (باید با 09 شروع شود)',
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
  // Handle empty input
  if (!email) {
    return {
      isValid: false,
      error: 'ایمیل نمی‌تواند خالی باشد',
    }
  }

  // Trim whitespace and convert to lowercase
  const trimmed = email.trim().toLowerCase()

  // Check minimum length
  const lettersOnly = trimmed.replace(/\s/g, '')
  if (lettersOnly.length < 3) {
    return {
      isValid: false,
      error: 'نام باید حداقل ۳ کاراکتر باشد',
    }
  }

  // Check maximum length (RFC 5321)
  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'ایمیل بیش از حد طولانی است',
    }
  }

  // Check format
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'فرمت ایمیل نامعتبر است',
    }
  }

  // Check for consecutive dots
  if (trimmed.includes('..')) {
    return {
      isValid: false,
      error: 'ایمیل نمی‌تواند نقطه‌های متوالی داشته باشد',
    }
  }

  // Split and validate local and domain parts
  const [localPart, domainPart] = trimmed.split('@')

  // Check local part length (max 64 chars)
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'بخش قبل از @ بیش از حد طولانی است',
    }
  }

  // Check domain has at least one dot
  if (!domainPart.includes('.')) {
    return {
      isValid: false,
      error: 'دامنه ایمیل باید شامل نقطه باشد',
    }
  }

  // Check TLD (top-level domain) length
  const tld = domainPart.split('.').pop()
  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      error: 'پسوند دامنه نامعتبر است',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate OTP code
 * @param code - OTP code to validate
 * @returns Validation result
 */
export function validateOTPCode(code: string): OTPValidationResult {
  // Handle empty input
  if (!code) {
    return {
      isValid: false,
      error: 'کد تایید نمی‌تواند خالی باشد',
    }
  }

  // Normalize Persian/Arabic digits
  const normalized = normalizePersianNumbers(code.trim())

  // Check length
  if (normalized.length !== 6) {
    return {
      isValid: false,
      error: 'کد تایید باید ۶ رقم باشد',
    }
  }

  // Check format
  if (!OTP_CODE_REGEX.test(normalized)) {
    return {
      isValid: false,
      error: 'کد تایید فقط باید شامل اعداد باشد',
    }
  }

  return {
    isValid: true,
  }
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
  if (!name) {
    return {
      isValid: false,
      error: 'نام نمی‌تواند خالی باشد',
    }
  }

  const trimmed = name.trim()

  // Count letters only (ignore spaces) for minimum length
  const lettersOnly = trimmed.replace(/\s+/g, '')
  if (lettersOnly.length < 3) {
    return {
      isValid: false,
      error: 'نام باید حداقل ۳ کاراکتر باشد',
    }
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'نام بیش از حد طولانی است (حداکثر ۱۰۰ کاراکتر)',
    }
  }

  if (!trimmed.includes(' ')) {
    return {
      isValid: false,
      error: 'لطفا نام و نام خانوادگی را وارد کنید',
    }
  }

  const validNameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/
  if (!validNameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'نام فقط می‌تواند شامل حروف فارسی یا انگلیسی باشد',
    }
  }

  if (/\s{2,}/.test(trimmed)) {
    return {
      isValid: false,
      error: 'نام نمی‌تواند فاصله‌های متوالی داشته باشد',
    }
  }

  return {
    isValid: true,
  }
}


/**
 * Validate Iranian postal code
 * @param postalCode - Postal code to validate
 * @returns Validation result
 */
export function validatePostalCode(postalCode: string): {
  isValid: boolean
  error?: string
} {
  // Handle empty input
  if (!postalCode) {
    return {
      isValid: false,
      error: 'کد پستی نمی‌تواند خالی باشد',
    }
  }

  // Normalize and remove spaces/dashes
  const cleaned = normalizePersianNumbers(postalCode.replace(/[\s\-]/g, ''))

  // Check length
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: 'کد پستی باید ۱۰ رقم باشد',
    }
  }

  // Check format
  if (!IRANIAN_POSTAL_CODE_REGEX.test(cleaned)) {
    return {
      isValid: false,
      error: 'کد پستی فقط باید شامل اعداد باشد',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate address
 * @param address - Address to validate
 * @returns Validation result
 */
export function validateAddress(address: string): {
  isValid: boolean
  error?: string
} {
  // Handle empty input
  if (!address) {
    return {
      isValid: false,
      error: 'آدرس نمی‌تواند خالی باشد',
    }
  }

  const trimmed = address.trim()

  // Check minimum length
  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: 'آدرس بیش از حد کوتاه است (حداقل ۱۰ کاراکتر)',
    }
  }

  // Check maximum length
  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: 'آدرس بیش از حد طولانی است (حداکثر ۵۰۰ کاراکتر)',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate date of birth
 * @param birthday - Date string in YYYY-MM-DD format
 * @returns Validation result
 */
export function validateBirthday(birthday: string): {
  isValid: boolean
  error?: string
} {
  // Handle empty input
  if (!birthday) {
    return {
      isValid: false,
      error: 'تاریخ تولد نمی‌تواند خالی باشد',
    }
  }

  // Check format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(birthday)) {
    return {
      isValid: false,
      error: 'فرمت تاریخ نامعتبر است (باید YYYY-MM-DD باشد)',
    }
  }

  // Parse date
  const date = new Date(birthday)

  // Check if valid date
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'تاریخ نامعتبر است',
    }
  }

  // Check if not in future
  if (date > new Date()) {
    return {
      isValid: false,
      error: 'تاریخ تولد نمی‌تواند در آینده باشد',
    }
  }

  // Check minimum age (13 years)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 13)
  if (date > minDate) {
    return {
      isValid: false,
      error: 'سن باید حداقل ۱۳ سال باشد',
    }
  }

  // Check maximum age (120 years)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 120)
  if (date < maxDate) {
    return {
      isValid: false,
      error: 'تاریخ تولد نامعتبر است',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate password strength
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

// ==================== UTILITY FUNCTIONS ====================

/**
 * Normalize Persian/Arabic digits to English
 * @param input - String with potential Persian/Arabic digits
 * @returns String with English digits
 */
export function normalizePersianNumbers(input: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

  let result = input

  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), index.toString())
  })

  arabicDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), index.toString())
  })

  return result
}

/**
 * Sanitize input string
 * Removes dangerous characters and XSS vectors
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:text\/html/gi, '') // Remove data URIs
    .replace(/<script/gi, '') // Remove script tags
    .replace(/<iframe/gi, '') // Remove iframe tags
    .slice(0, 1000) // Limit length to prevent DoS
}

/**
 * Check if string contains only Persian characters
 */
export function isPersian(text: string): boolean {
  if (!text) return false
  return /^[\u0600-\u06FF\s]+$/.test(text.trim())
}

/**
 * Check if string contains only English characters
 */
export function isEnglish(text: string): boolean {
  if (!text) return false
  return /^[a-zA-Z\s]+$/.test(text.trim())
}

/**
 * Validate multiple fields at once
 * Useful for form validation
 */
export function validateProfileForm(data: {
  fullName?: string
  email?: string
  phoneNumber?: string
  address?: string
  postalCode?: string
  birthday?: string
}): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (data.fullName !== undefined) {
    const nameResult = validateFullName(data.fullName)
    if (!nameResult.isValid && nameResult.error) {
      errors.fullName = nameResult.error
    }
  }

  if (data.email !== undefined && data.email.trim()) {
    const emailResult = validateEmail(data.email)
    if (!emailResult.isValid && emailResult.error) {
      errors.email = emailResult.error
    }
  }

  if (data.phoneNumber !== undefined && data.phoneNumber.trim()) {
    const phoneResult = validatePhoneNumber(data.phoneNumber)
    if (!phoneResult.isValid && phoneResult.error) {
      errors.phoneNumber = phoneResult.error
    }
  }

  if (data.address !== undefined && data.address.trim()) {
    const addressResult = validateAddress(data.address)
    if (!addressResult.isValid && addressResult.error) {
      errors.address = addressResult.error
    }
  }

  if (data.postalCode !== undefined && data.postalCode.trim()) {
    const postalResult = validatePostalCode(data.postalCode)
    if (!postalResult.isValid && postalResult.error) {
      errors.postalCode = postalResult.error
    }
  }

  if (data.birthday !== undefined && data.birthday.trim()) {
    const birthdayResult = validateBirthday(data.birthday)
    if (!birthdayResult.isValid && birthdayResult.error) {
      errors.birthday = birthdayResult.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}