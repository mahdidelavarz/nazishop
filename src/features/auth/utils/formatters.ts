// src/features/auth/utils/formatters.ts

import { normalizePersianNumbers } from './validators'

// ==================== PHONE NUMBER FORMATTERS ====================

/**
 * Format phone number for display
 * Converts 09123456789 to 0912 345 6789
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''

  // Normalize Persian/Arabic digits first
  const normalized = normalizePersianNumbers(phone)
  
  // Remove non-digits
  const cleaned = normalized.replace(/\D/g, '')

  // Format: 0912 345 6789 (Iranian local format)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  // Format: 98 912 345 6789 (international format)
  if (cleaned.length === 12 && cleaned.startsWith('98')) {
    return `+98 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }

  // Return cleaned version if format unknown
  return cleaned || phone
}

/**
 * Convert phone to Kavenegar format (international)
 * Converts 09123456789 to 989123456789
 * @param phone - Phone number
 * @returns Phone in international format
 */
export function toKavenegarFormat(phone: string): string {
  if (!phone) return ''
  
  // Normalize Persian/Arabic digits
  const normalized = normalizePersianNumbers(phone)
  const cleaned = normalized.replace(/\D/g, '')

  // Already in international format
  if (cleaned.startsWith('98') && cleaned.length === 12) {
    return cleaned
  }

  // Convert from local format
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '98' + cleaned.slice(1)
  }

  // Assume local format without 0
  if (cleaned.length === 10) {
    return '98' + cleaned
  }

  return cleaned
}

/**
 * Convert international phone to local format
 * Converts 989123456789 to 09123456789
 * @param phone - Phone number
 * @returns Phone in local format
 */
export function toLocalFormat(phone: string): string {
  if (!phone) return ''
  
  // Normalize Persian/Arabic digits
  const normalized = normalizePersianNumbers(phone)
  const cleaned = normalized.replace(/\D/g, '')

  // Convert from international format
  if (cleaned.startsWith('98') && cleaned.length === 12) {
    return '0' + cleaned.slice(2)
  }

  // Already in local format
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned
  }

  // Assume format without 0
  if (cleaned.length === 10) {
    return '0' + cleaned
  }

  return cleaned
}

/**
 * Mask phone number for display
 * Converts 09123456789 to 0912***6789
 * @param phone - Phone number to mask
 * @param showDigits - Number of digits to show at start and end (default: 4)
 * @returns Masked phone number
 */
export function maskPhoneNumber(phone: string, showDigits: number = 4): string {
  if (!phone) return ''

  const normalized = normalizePersianNumbers(phone)
  const cleaned = normalized.replace(/\D/g, '')
  
  if (cleaned.length < showDigits * 2) return phone

  const start = cleaned.slice(0, showDigits)
  const end = cleaned.slice(-showDigits)
  const masked = '*'.repeat(cleaned.length - (showDigits * 2))

  return `${start}${masked}${end}`
}

// ==================== EMAIL FORMATTERS ====================

/**
 * Mask email for display
 * Converts test@example.com to t**t@example.com
 * @param email - Email to mask
 * @returns Masked email
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email

  const [localPart, domain] = email.split('@')

  // Very short local part
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`
  }

  // Mask middle characters
  const firstChar = localPart[0]
  const lastChar = localPart[localPart.length - 1]
  const middleLength = Math.max(1, localPart.length - 2)
  const masked = '*'.repeat(middleLength)

  return `${firstChar}${masked}${lastChar}@${domain}`
}

// ==================== POSTAL CODE FORMATTERS ====================

/**
 * Format postal code for display
 * Converts 1234567890 to 1234-567-890
 * @param postalCode - Postal code to format
 * @returns Formatted postal code
 */
export function formatPostalCode(postalCode: string): string {
  if (!postalCode) return ''

  const normalized = normalizePersianNumbers(postalCode)
  const cleaned = normalized.replace(/\D/g, '')

  if (cleaned.length !== 10) return postalCode

  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
}

// ==================== OTP CODE FORMATTERS ====================

/**
 * Format OTP code for display
 * Converts 123456 to 123-456
 * @param otpCode - OTP code to format
 * @returns Formatted OTP code
 */
export function formatOTPCode(otpCode: string): string {
  if (!otpCode) return ''

  const normalized = normalizePersianNumbers(otpCode)
  const cleaned = normalized.replace(/\D/g, '')

  if (cleaned.length !== 6) return otpCode

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
}

// ==================== DATE FORMATTERS ====================

/**
 * Format date to Persian (Jalali calendar)
 * @param date - Date to format
 * @returns Formatted Persian date string
 */
export function formatPersianDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
}

/**
 * Format date to Persian with time
 * @param date - Date to format
 * @returns Formatted Persian date and time string
 */
export function formatPersianDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) {
      return ''
    }

    const dateStr = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d)

    const timeStr = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)

    return `${dateStr} ساعت ${timeStr}`
  } catch {
    return ''
  }
}

/**
 * Format relative time (e.g., "5 minutes ago")
 * @param date - Date to format
 * @returns Relative time string in Persian
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) {
      return ''
    }

    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffSeconds < 30) {
      return 'همین الان'
    } else if (diffSeconds < 60) {
      return `${diffSeconds} ثانیه پیش`
    } else if (diffMinutes === 1) {
      return 'یک دقیقه پیش'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} دقیقه پیش`
    } else if (diffHours === 1) {
      return 'یک ساعت پیش'
    } else if (diffHours < 24) {
      return `${diffHours} ساعت پیش`
    } else if (diffDays === 1) {
      return 'دیروز'
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`
    } else if (diffWeeks === 1) {
      return 'یک هفته پیش'
    } else if (diffWeeks < 4) {
      return `${diffWeeks} هفته پیش`
    } else if (diffMonths === 1) {
      return 'یک ماه پیش'
    } else if (diffMonths < 12) {
      return `${diffMonths} ماه پیش`
    } else {
      return formatPersianDate(d)
    }
  } catch {
    return ''
  }
}

/**
 * Format date to short Persian format
 * @param date - Date to format
 * @returns Short formatted date (e.g., "۱۴۰۲/۱۲/۱۵")
 */
export function formatShortPersianDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  } catch {
    return ''
  }
}

// ==================== CURRENCY FORMATTERS ====================

/**
 * Format currency in Toman (common Iranian currency unit)
 * Note: 1 Toman = 10 Rials
 * @param amountInRials - Amount in Rials
 * @param showCurrency - Whether to show currency symbol
 * @returns Formatted currency string
 */
export function formatToman(
  amountInRials: number,
  showCurrency: boolean = true
): string {
  const tomanAmount = Math.floor(amountInRials / 10)
  const formatted = new Intl.NumberFormat('fa-IR').format(tomanAmount)
  return showCurrency ? `${formatted} تومان` : formatted
}

/**
 * Format currency in Rials
 * @param amountInRials - Amount in Rials
 * @param showCurrency - Whether to show currency symbol
 * @returns Formatted currency string
 */
export function formatRials(
  amountInRials: number,
  showCurrency: boolean = true
): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amountInRials)
  return showCurrency ? `${formatted} ریال` : formatted
}

/**
 * Alias for formatToman (most commonly used)
 */
export const formatCurrency = formatToman

// ==================== NUMBER FORMATTERS ====================

/**
 * Convert English numbers to Persian
 * @param text - Text with English numbers
 * @returns Text with Persian numbers
 */
export function toPersianNumbers(text: string | number): string {
  if (text === null || text === undefined) return ''
  
  const str = text.toString()
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
}

/**
 * Convert Persian/Arabic numbers to English
 * Note: This is a re-export from validators for convenience
 * @param text - Text with Persian/Arabic numbers
 * @returns Text with English numbers
 */
export function toEnglishNumbers(text: string): string {
  return normalizePersianNumbers(text)
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @param locale - Locale (default: 'fa-IR')
 * @returns Formatted number
 */
export function formatNumber(num: number, locale: string = 'fa-IR'): string {
  return new Intl.NumberFormat(locale).format(num)
}

// ==================== FILE SIZE FORMATTERS ====================

/**
 * Format file size in Persian
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '۰ بایت'
  if (bytes < 0) return ''

  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  if (i >= sizes.length) return formatFileSize(bytes)

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  const formattedValue = toPersianNumbers(value)
  
  return `${formattedValue} ${sizes[i]}`
}

// ==================== TEXT UTILITIES ====================

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Capitalize first letter
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeFirst(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Capitalize each word
 * @param text - Text to capitalize
 * @returns Text with each word capitalized
 */
export function capitalizeWords(text: string): string {
  if (!text) return ''
  return text
    .split(/\s+/)
    .map(word => capitalizeFirst(word))
    .join(' ')
}

/**
 * Generate initials from name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials (e.g., "Ali Rezaei" -> "AR")
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return ''

  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return ''

  if (parts.length === 1) {
    return parts[0].slice(0, maxInitials).toUpperCase()
  }

  // Take first letter of each word, up to maxInitials
  return parts
    .slice(0, maxInitials)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

/**
 * Slugify text (convert to URL-friendly format)
 * @param text - Text to slugify
 * @returns Slugified text
 */
export function slugify(text: string): string {
  if (!text) return ''

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}

/**
 * Pluralize text in Persian
 * @param count - Count
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 'ها')
 * @returns Pluralized text
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const pluralForm = plural || `${singular}ها`
  return count === 1 ? singular : pluralForm
}

// ==================== VALIDATION FORMATTERS ====================

/**
 * Format validation error messages for display
 * @param errors - Record of field errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  if (!errors || Object.keys(errors).length === 0) return ''

  return Object.values(errors).join('، ')
}

/**
 * Format field name to Persian label
 * @param fieldName - Field name (e.g., 'fullName')
 * @returns Persian label (e.g., 'نام و نام خانوادگی')
 */
export function formatFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    fullName: 'نام و نام خانوادگی',
    phoneNumber: 'شماره موبایل',
    email: 'ایمیل',
    address: 'آدرس',
    postalCode: 'کد پستی',
    birthday: 'تاریخ تولد',
    password: 'رمز عبور',
    otpCode: 'کد تایید',
  }

  return labels[fieldName] || fieldName
}