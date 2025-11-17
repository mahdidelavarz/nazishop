// src/features/auth/utils/__tests__/validators.test.ts
import { describe, it, expect } from 'vitest'
import {
  validatePhoneNumber,
  validateEmail,
  validateOTPCode,
  validateFullName,
  validatePostalCode,
  validateAddress,
  validateBirthday,
  validatePassword,
  normalizePersianNumbers,
  sanitizeInput,
  isPersian,
  isEnglish,
  validateProfileForm,
} from '../validators'

describe('validators - Phone Number', () => {
  describe('validatePhoneNumber', () => {
    it('should accept valid Iranian phone number', () => {
      const result = validatePhoneNumber('09123456789')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('09123456789')
      expect(result.international).toBe('989123456789')
    })

    it('should accept phone with spaces and dashes', () => {
      const result = validatePhoneNumber('0912-345-6789')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('09123456789')
    })

    it('should normalize Persian digits', () => {
      const result = validatePhoneNumber('۰۹۱۲۳۴۵۶۷۸۹')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('09123456789')
    })

    it('should handle +98 prefix', () => {
      const result = validatePhoneNumber('+989123456789')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('09123456789')
    })

    it('should handle 98 prefix without plus', () => {
      const result = validatePhoneNumber('989123456789')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('09123456789')
    })

    it('should reject invalid operator codes', () => {
      const result = validatePhoneNumber('09991234567') // 999 is invalid
      expect(result.isValid).toBe(false)
    })

    it('should reject too short numbers', () => {
      const result = validatePhoneNumber('091234567')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('۱۱ رقم')
    })

    it('should reject too long numbers', () => {
      const result = validatePhoneNumber('091234567899')
      expect(result.isValid).toBe(false)
    })

    it('should reject numbers not starting with 09', () => {
      const result = validatePhoneNumber('08123456789')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty input', () => {
      const result = validatePhoneNumber('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('خالی')
    })

    it('should accept all valid Iranian operator codes', () => {
      const validNumbers = [
        '09101234567', // Hamrah-e Aval
        '09121234567', // Hamrah-e Aval
        '09351234567', // Irancell
        '09391234567', // Irancell
        '09901234567', // Rightel
        '09211234567', // Shatel
      ]

      validNumbers.forEach(number => {
        const result = validatePhoneNumber(number)
        expect(result.isValid).toBe(true)
      })
    })
  })
})

describe('validators - Email', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should accept email with subdomain', () => {
      const result = validateEmail('test@mail.example.com')
      expect(result.isValid).toBe(true)
    })

    it('should accept email with plus', () => {
      const result = validateEmail('test+tag@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should accept email with dots', () => {
      const result = validateEmail('first.last@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should reject email without @', () => {
      const result = validateEmail('testexample.com')
      expect(result.isValid).toBe(false)
    })

    it('should reject email without domain', () => {
      const result = validateEmail('test@')
      expect(result.isValid).toBe(false)
    })

    it('should reject email without TLD', () => {
      const result = validateEmail('test@example')
      expect(result.isValid).toBe(false)
    })

    it('should reject email with consecutive dots', () => {
      const result = validateEmail('test..name@example.com')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.isValid).toBe(false)
    })

    it('should reject email with spaces', () => {
      const result = validateEmail('test name@example.com')
      expect(result.isValid).toBe(false)
    })

    it('should reject too long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      const result = validateEmail(longEmail)
      expect(result.isValid).toBe(false)
    })

    it('should handle whitespace trimming', () => {
      const result = validateEmail('  test@example.com  ')
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid TLD', () => {
      const result = validateEmail('test@example.c')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validators - OTP Code', () => {
  describe('validateOTPCode', () => {
    it('should accept valid 6-digit code', () => {
      const result = validateOTPCode('123456')
      expect(result.isValid).toBe(true)
    })

    it('should normalize Persian digits', () => {
      const result = validateOTPCode('۱۲۳۴۵۶')
      expect(result.isValid).toBe(true)
    })

    it('should reject 5-digit code', () => {
      const result = validateOTPCode('12345')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('۶ رقم')
    })

    it('should reject 7-digit code', () => {
      const result = validateOTPCode('1234567')
      expect(result.isValid).toBe(false)
    })

    it('should reject code with letters', () => {
      const result = validateOTPCode('12345a')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty code', () => {
      const result = validateOTPCode('')
      expect(result.isValid).toBe(false)
    })

    it('should handle whitespace', () => {
      const result = validateOTPCode('  123456  ')
      expect(result.isValid).toBe(true)
    })
  })
})

describe('validators - Full Name', () => {
  describe('validateFullName', () => {
    it('should accept valid Persian name', () => {
      const result = validateFullName('علی رضایی')
      expect(result.isValid).toBe(true)
    })

    it('should accept valid English name', () => {
      const result = validateFullName('John Doe')
      expect(result.isValid).toBe(true)
    })

    it('should accept mixed Persian and English', () => {
      const result = validateFullName('علی Smith')
      expect(result.isValid).toBe(true)
    })

    it('should reject single word (no last name)', () => {
      const result = validateFullName('علی')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('نام و نام خانوادگی')
    })

    it('should reject too short name', () => {
      const result = validateFullName('A B')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('۳ کاراکتر')
    })

    it('should reject too long name', () => {
      const longName = 'A'.repeat(101)
      const result = validateFullName(longName)
      expect(result.isValid).toBe(false)
    })

    it('should reject name with numbers', () => {
      const result = validateFullName('علی 123')
      expect(result.isValid).toBe(false)
    })

    it('should reject name with special characters', () => {
      const result = validateFullName('علی@رضایی')
      expect(result.isValid).toBe(false)
    })

    it('should reject excessive spaces', () => {
      const result = validateFullName('علی  رضایی')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty name', () => {
      const result = validateFullName('')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validators - Postal Code', () => {
  describe('validatePostalCode', () => {
    it('should accept valid 10-digit postal code', () => {
      const result = validatePostalCode('1234567890')
      expect(result.isValid).toBe(true)
    })

    it('should normalize Persian digits', () => {
      const result = validatePostalCode('۱۲۳۴۵۶۷۸۹۰')
      expect(result.isValid).toBe(true)
    })

    it('should accept postal code with spaces', () => {
      const result = validatePostalCode('1234 567 890')
      expect(result.isValid).toBe(true)
    })

    it('should accept postal code with dashes', () => {
      const result = validatePostalCode('1234-567-890')
      expect(result.isValid).toBe(true)
    })

    it('should reject too short postal code', () => {
      const result = validatePostalCode('123456789')
      expect(result.isValid).toBe(false)
    })

    it('should reject too long postal code', () => {
      const result = validatePostalCode('12345678901')
      expect(result.isValid).toBe(false)
    })

    it('should reject postal code with letters', () => {
      const result = validatePostalCode('123456789A')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty postal code', () => {
      const result = validatePostalCode('')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validators - Address', () => {
  describe('validateAddress', () => {
    it('should accept valid address', () => {
      const result = validateAddress('تهران، خیابان آزادی، پلاک ۱۲۳')
      expect(result.isValid).toBe(true)
    })

    it('should accept English address', () => {
      const result = validateAddress('123 Main Street, Tehran')
      expect(result.isValid).toBe(true)
    })

    it('should reject too short address', () => {
      const result = validateAddress('تهران')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('کوتاه')
    })

    it('should reject too long address', () => {
      const longAddress = 'A'.repeat(501)
      const result = validateAddress(longAddress)
      expect(result.isValid).toBe(false)
    })

    it('should reject empty address', () => {
      const result = validateAddress('')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validators - Birthday', () => {
  describe('validateBirthday', () => {
    it('should accept valid date', () => {
      const result = validateBirthday('1990-01-01')
      expect(result.isValid).toBe(true)
    })

    it('should reject future date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const dateStr = futureDate.toISOString().split('T')[0]
      const result = validateBirthday(dateStr)
      expect(result.isValid).toBe(false)
    })

    it('should reject age under 13', () => {
      const recentDate = new Date()
      recentDate.setFullYear(recentDate.getFullYear() - 10)
      const dateStr = recentDate.toISOString().split('T')[0]
      const result = validateBirthday(dateStr)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('۱۳ سال')
    })

    it('should reject age over 120', () => {
      const result = validateBirthday('1800-01-01')
      expect(result.isValid).toBe(false)
    })

    it('should reject invalid format', () => {
      const result = validateBirthday('01-01-1990')
      expect(result.isValid).toBe(false)
    })

    it('should reject invalid date', () => {
      const result = validateBirthday('1990-13-32')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty date', () => {
      const result = validateBirthday('')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validators - Password', () => {
  describe('validatePassword', () => {
    it('should accept strong password', () => {
      const result = validatePassword('MyP@ssw0rd123')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
    })

    it('should accept medium password', () => {
      const result = validatePassword('MyPassword123')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
    })

    it('should reject weak password', () => {
      const result = validatePassword('password')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
    })

    it('should reject too short password', () => {
      const result = validatePassword('Pass1!')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validators - Utility Functions', () => {
  describe('normalizePersianNumbers', () => {
    it('should convert Persian digits to English', () => {
      const result = normalizePersianNumbers('۰۱۲۳۴۵۶۷۸۹')
      expect(result).toBe('0123456789')
    })

    it('should convert Arabic digits to English', () => {
      const result = normalizePersianNumbers('٠١٢٣٤٥٦٧٨٩')
      expect(result).toBe('0123456789')
    })

    it('should handle mixed content', () => {
      const result = normalizePersianNumbers('۰۹۱۲-345-۶۷۸۹')
      expect(result).toBe('0912-345-6789')
    })

    it('should not change English digits', () => {
      const result = normalizePersianNumbers('0123456789')
      expect(result).toBe('0123456789')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>')
      expect(result).not.toContain('<script')
    })

    it('should remove javascript protocol', () => {
      const result = sanitizeInput('javascript:alert("xss")')
      expect(result).not.toContain('javascript:')
    })

    it('should remove event handlers', () => {
      const result = sanitizeInput('onclick=alert("xss")')
      expect(result).not.toContain('onclick')
    })

    it('should trim whitespace', () => {
      const result = sanitizeInput('  hello  ')
      expect(result).toBe('hello')
    })

    it('should limit length', () => {
      const longString = 'A'.repeat(1500)
      const result = sanitizeInput(longString)
      expect(result.length).toBeLessThanOrEqual(1000)
    })

    it('should handle empty string', () => {
      const result = sanitizeInput('')
      expect(result).toBe('')
    })
  })

  describe('isPersian', () => {
    it('should return true for Persian text', () => {
      expect(isPersian('سلام دنیا')).toBe(true)
    })

    it('should return false for English text', () => {
      expect(isPersian('Hello World')).toBe(false)
    })

    it('should return false for mixed text', () => {
      expect(isPersian('سلام World')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isPersian('')).toBe(false)
    })
  })

  describe('isEnglish', () => {
    it('should return true for English text', () => {
      expect(isEnglish('Hello World')).toBe(true)
    })

    it('should return false for Persian text', () => {
      expect(isEnglish('سلام دنیا')).toBe(false)
    })

    it('should return false for mixed text', () => {
      expect(isEnglish('Hello دنیا')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isEnglish('')).toBe(false)
    })
  })
})

describe('validators - Profile Form', () => {
  describe('validateProfileForm', () => {
    it('should validate all fields correctly', () => {
      const result = validateProfileForm({
        fullName: 'علی رضایی',
        email: 'ali@example.com',
        phoneNumber: '09123456789',
        address: 'تهران، خیابان آزادی، پلاک ۱۲۳',
        postalCode: '1234567890',
        birthday: '1990-01-01',
      })

      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should return errors for invalid fields', () => {
      const result = validateProfileForm({
        fullName: 'علی', // No last name
        email: 'invalid-email',
        phoneNumber: '123',
        postalCode: '123',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.fullName).toBeDefined()
      expect(result.errors.email).toBeDefined()
      expect(result.errors.phoneNumber).toBeDefined()
      expect(result.errors.postalCode).toBeDefined()
    })

    it('should skip validation for undefined fields', () => {
      const result = validateProfileForm({
        fullName: 'علی رضایی',
      })

      expect(result.isValid).toBe(true)
      expect(result.errors.email).toBeUndefined()
      expect(result.errors.phoneNumber).toBeUndefined()
    })

    it('should skip validation for empty optional fields', () => {
      const result = validateProfileForm({
        fullName: 'علی رضایی',
        email: '', // Empty but not required
      })

      expect(result.isValid).toBe(true)
    })
  })
})