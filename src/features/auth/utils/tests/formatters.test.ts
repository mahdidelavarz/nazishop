// src/features/auth/utils/__tests__/formatters.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatPhoneNumber,
  toKavenegarFormat,
  toLocalFormat,
  maskPhoneNumber,
  maskEmail,
  formatPostalCode,
  formatOTPCode,
  formatPersianDate,
  formatPersianDateTime,
  formatRelativeTime,
  formatShortPersianDate,
  formatToman,
  formatRials,
  formatCurrency,
  toPersianNumbers,
  toEnglishNumbers,
  formatNumber,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  getInitials,
  slugify,
  pluralize,
  formatValidationErrors,
  formatFieldLabel,
} from '../formatters'

describe('formatters - Phone Number', () => {
  describe('formatPhoneNumber', () => {
    it('should format Iranian phone number', () => {
      expect(formatPhoneNumber('09123456789')).toBe('0912 345 6789')
    })

    it('should format international phone number', () => {
      expect(formatPhoneNumber('989123456789')).toBe('+98 912 345 6789')
    })

    it('should handle Persian digits', () => {
      expect(formatPhoneNumber('۰۹۱۲۳۴۵۶۷۸۹')).toBe('0912 345 6789')
    })

    it('should handle phone with dashes', () => {
      expect(formatPhoneNumber('0912-345-6789')).toBe('0912 345 6789')
    })

    it('should return empty string for empty input', () => {
      expect(formatPhoneNumber('')).toBe('')
    })

    it('should return cleaned version for unknown format', () => {
      const result = formatPhoneNumber('123')
      expect(result).toBe('123')
    })
  })

  describe('toKavenegarFormat', () => {
    it('should convert local to international format', () => {
      expect(toKavenegarFormat('09123456789')).toBe('989123456789')
    })

    it('should keep international format', () => {
      expect(toKavenegarFormat('989123456789')).toBe('989123456789')
    })

    it('should handle number without leading 0', () => {
      expect(toKavenegarFormat('9123456789')).toBe('989123456789')
    })

    it('should handle Persian digits', () => {
      expect(toKavenegarFormat('۰۹۱۲۳۴۵۶۷۸۹')).toBe('989123456789')
    })

    it('should return empty string for empty input', () => {
      expect(toKavenegarFormat('')).toBe('')
    })
  })

  describe('toLocalFormat', () => {
    it('should convert international to local format', () => {
      expect(toLocalFormat('989123456789')).toBe('09123456789')
    })

    it('should keep local format', () => {
      expect(toLocalFormat('09123456789')).toBe('09123456789')
    })

    it('should handle number without leading 0', () => {
      expect(toLocalFormat('9123456789')).toBe('09123456789')
    })

    it('should handle Persian digits', () => {
      expect(toLocalFormat('۹۸۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
    })

    it('should return empty string for empty input', () => {
      expect(toLocalFormat('')).toBe('')
    })
  })

  describe('maskPhoneNumber', () => {
    it('should mask phone number with default settings', () => {
      expect(maskPhoneNumber('09123456789')).toBe('0912***6789')
    })

    it('should mask with custom digit count', () => {
      expect(maskPhoneNumber('09123456789', 3)).toBe('091****789')
    })

    it('should handle Persian digits', () => {
      expect(maskPhoneNumber('۰۹۱۲۳۴۵۶۷۸۹')).toBe('0912***6789')
    })

    it('should return original for too short numbers', () => {
      expect(maskPhoneNumber('123')).toBe('123')
    })

    it('should return empty string for empty input', () => {
      expect(maskPhoneNumber('')).toBe('')
    })
  })
})

describe('formatters - Email', () => {
  describe('maskEmail', () => {
    it('should mask email with medium length local part', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com')
    })

    it('should mask email with long local part', () => {
      expect(maskEmail('verylongname@example.com')).toBe('v**********e@example.com')
    })

    it('should mask email with short local part', () => {
      expect(maskEmail('ab@example.com')).toBe('a*@example.com')
    })

    it('should handle single character local part', () => {
      expect(maskEmail('a@example.com')).toBe('a*@example.com')
    })

    it('should return original for invalid email', () => {
      expect(maskEmail('notanemail')).toBe('notanemail')
    })

    it('should return empty string for empty input', () => {
      expect(maskEmail('')).toBe('')
    })
  })
})

describe('formatters - Postal Code', () => {
  describe('formatPostalCode', () => {
    it('should format postal code', () => {
      expect(formatPostalCode('1234567890')).toBe('1234-567-890')
    })

    it('should handle Persian digits', () => {
      expect(formatPostalCode('۱۲۳۴۵۶۷۸۹۰')).toBe('1234-567-890')
    })

    it('should return original for invalid length', () => {
      expect(formatPostalCode('123')).toBe('123')
    })

    it('should return empty string for empty input', () => {
      expect(formatPostalCode('')).toBe('')
    })
  })
})

describe('formatters - OTP Code', () => {
  describe('formatOTPCode', () => {
    it('should format OTP code', () => {
      expect(formatOTPCode('123456')).toBe('123-456')
    })

    it('should handle Persian digits', () => {
      expect(formatOTPCode('۱۲۳۴۵۶')).toBe('123-456')
    })

    it('should return original for invalid length', () => {
      expect(formatOTPCode('1234')).toBe('1234')
    })

    it('should return empty string for empty input', () => {
      expect(formatOTPCode('')).toBe('')
    })
  })
})

describe('formatters - Date', () => {
  describe('formatPersianDate', () => {
    it('should format date to Persian', () => {
      const date = new Date('2024-01-15')
      const result = formatPersianDate(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle string date', () => {
      const result = formatPersianDate('2024-01-15')
      expect(result).toBeTruthy()
    })

    it('should return empty string for invalid date', () => {
      expect(formatPersianDate('invalid')).toBe('')
    })
  })

  describe('formatPersianDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatPersianDateTime(date)
      expect(result).toContain('ساعت')
    })

    it('should return empty string for invalid date', () => {
      expect(formatPersianDateTime('invalid')).toBe('')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    })

    it('should show "همین الان" for recent times', () => {
      const date = new Date('2024-01-15T11:59:50')
      expect(formatRelativeTime(date)).toBe('همین الان')
    })

    it('should show seconds ago', () => {
      const date = new Date('2024-01-15T11:59:00')
      expect(formatRelativeTime(date)).toContain('ثانیه پیش')
    })

    it('should show "یک دقیقه پیش" for 1 minute', () => {
      const date = new Date('2024-01-15T11:59:00')
      expect(formatRelativeTime(date)).toContain('دقیقه پیش')
    })

    it('should show minutes ago', () => {
      const date = new Date('2024-01-15T11:45:00')
      expect(formatRelativeTime(date)).toContain('دقیقه پیش')
    })

    it('should show "یک ساعت پیش" for 1 hour', () => {
      const date = new Date('2024-01-15T11:00:00')
      expect(formatRelativeTime(date)).toBe('یک ساعت پیش')
    })

    it('should show hours ago', () => {
      const date = new Date('2024-01-15T10:00:00')
      expect(formatRelativeTime(date)).toContain('ساعت پیش')
    })

    it('should show "دیروز" for yesterday', () => {
      const date = new Date('2024-01-14T12:00:00')
      expect(formatRelativeTime(date)).toBe('دیروز')
    })

    it('should show days ago', () => {
      const date = new Date('2024-01-10T12:00:00')
      expect(formatRelativeTime(date)).toContain('روز پیش')
    })

    it('should return empty string for invalid date', () => {
      expect(formatRelativeTime('invalid')).toBe('')
    })

    vi.useRealTimers()
  })

  describe('formatShortPersianDate', () => {
    it('should format short date', () => {
      const date = new Date('2024-01-15')
      const result = formatShortPersianDate(date)
      expect(result).toBeTruthy()
      expect(result).toContain('/')
    })

    it('should return empty string for invalid date', () => {
      expect(formatShortPersianDate('invalid')).toBe('')
    })
  })
})

describe('formatters - Currency', () => {
  describe('formatToman', () => {
    it('should format Rials to Toman', () => {
      expect(formatToman(100000)).toContain('10000')
      expect(formatToman(100000)).toContain('تومان')
    })

    it('should format without currency symbol', () => {
      const result = formatToman(100000, false)
      expect(result).not.toContain('تومان')
    })

    it('should handle zero', () => {
      expect(formatToman(0)).toContain('۰')
    })

    it('should use Persian digits', () => {
      const result = formatToman(100000)
      expect(result).toMatch(/[۰-۹]/)
    })
  })

  describe('formatRials', () => {
    it('should format Rials', () => {
      expect(formatRials(100000)).toContain('100000')
      expect(formatRials(100000)).toContain('ریال')
    })

    it('should format without currency symbol', () => {
      const result = formatRials(100000, false)
      expect(result).not.toContain('ریال')
    })
  })

  describe('formatCurrency', () => {
    it('should be alias for formatToman', () => {
      expect(formatCurrency(100000)).toBe(formatToman(100000))
    })
  })
})

describe('formatters - Numbers', () => {
  describe('toPersianNumbers', () => {
    it('should convert English to Persian digits', () => {
      expect(toPersianNumbers('0123456789')).toBe('۰۱۲۳۴۵۶۷۸۹')
    })

    it('should handle numbers', () => {
      expect(toPersianNumbers(123)).toBe('۱۲۳')
    })

    it('should handle mixed content', () => {
      const result = toPersianNumbers('Test 123')
      expect(result).toContain('۱۲۳')
      expect(result).toContain('Test')
    })

    it('should return empty string for null/undefined', () => {
      expect(toPersianNumbers(null as any)).toBe('')
      expect(toPersianNumbers(undefined as any)).toBe('')
    })
  })

  describe('toEnglishNumbers', () => {
    it('should convert Persian to English digits', () => {
      expect(toEnglishNumbers('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789')
    })

    it('should convert Arabic to English digits', () => {
      expect(toEnglishNumbers('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789')
    })
  })

  describe('formatNumber', () => {
    it('should format number with Persian separators', () => {
      const result = formatNumber(1000000)
      expect(result).toBeTruthy()
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBeTruthy()
    })
  })
})

describe('formatters - File Size', () => {
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('۰ بایت')
      expect(formatFileSize(500)).toContain('بایت')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toContain('کیلوبایت')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toContain('مگابایت')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toContain('گیگابایت')
    })

    it('should return empty string for negative', () => {
      expect(formatFileSize(-100)).toBe('')
    })
  })
})

describe('formatters - Text Utilities', () => {
  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...')
    })

    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello')
    })

    it('should use custom ellipsis', () => {
      expect(truncateText('Hello World', 8, '…')).toBe('Hello W…')
    })

    it('should return empty for empty input', () => {
      expect(truncateText('', 10)).toBe('')
    })
  })

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
    })

    it('should lowercase rest', () => {
      expect(capitalizeFirst('hELLO')).toBe('Hello')
    })

    it('should return empty for empty input', () => {
      expect(capitalizeFirst('')).toBe('')
    })
  })

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World')
    })

    it('should handle multiple spaces', () => {
      expect(capitalizeWords('hello  world')).toBe('Hello  World')
    })

    it('should return empty for empty input', () => {
      expect(capitalizeWords('')).toBe('')
    })
  })

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('JO')
    })

    it('should handle three names', () => {
      expect(getInitials('John Middle Doe')).toBe('JM')
    })

    it('should respect maxInitials', () => {
      expect(getInitials('John Middle Doe', 3)).toBe('JMD')
    })

    it('should return empty for empty input', () => {
      expect(getInitials('')).toBe('')
    })
  })

  describe('slugify', () => {
    it('should slugify text', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(slugify('Hello  World')).toBe('hello-world')
    })

    it('should return empty for empty input', () => {
      expect(slugify('')).toBe('')
    })
  })

  describe('pluralize', () => {
    it('should return singular for count 1', () => {
      expect(pluralize(1, 'کاربر')).toBe('کاربر')
    })

    it('should return plural for count > 1', () => {
      expect(pluralize(2, 'کاربر')).toBe('کاربرها')
    })

    it('should use custom plural', () => {
      expect(pluralize(2, 'فرد', 'افراد')).toBe('افراد')
    })
  })
})

describe('formatters - Validation', () => {
  describe('formatValidationErrors', () => {
    it('should format multiple errors', () => {
      const errors = {
        email: 'ایمیل نامعتبر است',
        phone: 'شماره موبایل نامعتبر است',
      }
      const result = formatValidationErrors(errors)
      expect(result).toContain('ایمیل نامعتبر است')
      expect(result).toContain('شماره موبایل نامعتبر است')
      expect(result).toContain('،')
    })

    it('should return empty for no errors', () => {
      expect(formatValidationErrors({})).toBe('')
    })

    it('should return empty for null/undefined', () => {
      expect(formatValidationErrors(null as any)).toBe('')
      expect(formatValidationErrors(undefined as any)).toBe('')
    })
  })

  describe('formatFieldLabel', () => {
    it('should return Persian label for known fields', () => {
      expect(formatFieldLabel('fullName')).toBe('نام و نام خانوادگی')
      expect(formatFieldLabel('phoneNumber')).toBe('شماره موبایل')
      expect(formatFieldLabel('email')).toBe('ایمیل')
    })

    it('should return original for unknown fields', () => {
      expect(formatFieldLabel('unknownField')).toBe('unknownField')
    })
  })
})