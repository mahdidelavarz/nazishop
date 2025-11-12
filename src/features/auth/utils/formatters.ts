// src/features/auth/utils/formatters.ts

/**
 * Format phone number for display
 * Converts 09123456789 to 0912 345 6789
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''

  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '')

  // Format: 0912 345 6789
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  // Format: 912 345 6789 (if starts with 98)
  if (cleaned.length === 12 && cleaned.startsWith('98')) {
    return `${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }

  return phone
}

/**
 * Convert phone to Kavenegar format
 * Converts 09123456789 to 989123456789
 * @param phone - Phone number
 * @returns Phone in international format
 */
export function toKavenegarFormat(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('0')) {
    return '98' + cleaned.slice(1)
  }

  if (cleaned.startsWith('98')) {
    return cleaned
  }

  return '98' + cleaned
}

/**
 * Convert international phone to local format
 * Converts 989123456789 to 09123456789
 * @param phone - Phone number
 * @returns Phone in local format
 */
export function toLocalFormat(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('98')) {
    return '0' + cleaned.slice(2)
  }

  if (cleaned.startsWith('0')) {
    return cleaned
  }

  return '0' + cleaned
}

/**
 * Format date to Persian
 * @param date - Date to format
 * @returns Formatted Persian date string
 */
export function formatPersianDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format date to Persian with time
 * @param date - Date to format
 * @returns Formatted Persian date and time string
 */
export function formatPersianDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

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
}

/**
 * Format relative time (e.g., "5 minutes ago")
 * @param date - Date to format
 * @returns Relative time string in Persian
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'همین الان'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} دقیقه پیش`
  } else if (diffHours < 24) {
    return `${diffHours} ساعت پیش`
  } else if (diffDays < 7) {
    return `${diffDays} روز پیش`
  } else {
    return formatPersianDate(d)
  }
}

/**
 * Mask phone number for display
 * Converts 09123456789 to 0912***6789
 * @param phone - Phone number to mask
 * @returns Masked phone number
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 11) return phone

  const cleaned = phone.replace(/\D/g, '')
  return `${cleaned.slice(0, 4)}***${cleaned.slice(-4)}`
}

/**
 * Mask email for display
 * Converts test@example.com to t**t@example.com
 * @param email - Email to mask
 * @returns Masked email
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email

  const [localPart, domain] = email.split('@')

  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`
  }

  const masked = `${localPart[0]}${'*'.repeat(localPart.length - 2)}${
    localPart[localPart.length - 1]
  }`

  return `${masked}@${domain}`
}

/**
 * Format file size
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت'

  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format currency (Iranian Rial)
 * @param amount - Amount to format
 * @param showCurrency - Whether to show currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  showCurrency: boolean = true
): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount)
  return showCurrency ? `${formatted} تومان` : formatted
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Convert English numbers to Persian
 * @param text - Text with English numbers
 * @returns Text with Persian numbers
 */
export function toPersianNumbers(text: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return text.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
}

/**
 * Convert Persian numbers to English
 * @param text - Text with Persian numbers
 * @returns Text with English numbers
 */
export function toEnglishNumbers(text: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return text.replace(/[۰-۹]/g, (digit) =>
    persianDigits.indexOf(digit).toString()
  )
}

/**
 * Capitalize first letter
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeFirst(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Generate initials from name
 * @param name - Full name
 * @returns Initials (e.g., "Ali Rezaei" -> "AR")
 */
export function getInitials(name: string): string {
  if (!name) return ''

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}