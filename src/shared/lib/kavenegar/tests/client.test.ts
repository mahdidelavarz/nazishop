// src/shared/lib/kavenegar/__tests__/client.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  sendSMS,
  sendBulkSMS,
  sendOTPSMS,
  sendOTPViaTemplate,
  checkSMSStatus,
  getAccountCredit,
  isPhoneBlacklisted,
  getKavenegarConfig,
  clearKavenegarClient,
} from '../client'
import type { SMSParams, BulkSMSParams, OTPTemplateParams } from '../types'

// Mock environment variables
const mockEnv = {
  KAVENEGAR_API_KEY: 'test-api-key',
  KAVENEGAR_SENDER: '10004346',
  NODE_ENV: 'development',
}

// Mock Kavenegar module
vi.mock('kavenegar', () => {
  return {
    default: {
      KavenegarApi: vi.fn(() => ({
        Send: vi.fn((params, callback) => {
          callback(
            {
              return: [
                {
                  messageid: 123456,
                  message: 'Test message',
                  status: 1,
                  statustext: 'در صف ارسال',
                  sender: '10004346',
                  receptor: '989123456789',
                  date: Date.now(),
                  cost: 100,
                },
              ],
            },
            200
          )
        }),
        VerifyLookup: vi.fn((params, callback) => {
          callback(
            {
              return: [
                {
                  messageid: 789012,
                  status: 1,
                  cost: 100,
                },
              ],
            },
            200
          )
        }),
        Status: vi.fn((params, callback) => {
          callback(
            {
              return: [
                {
                  messageid: 123456,
                  status: 10,
                  statustext: 'رسیده به گیرنده',
                },
              ],
            },
            200
          )
        }),
        AccountInfo: vi.fn((callback) => {
          callback(
            {
              return: {
                remaincredit: 1000000,
              },
            },
            200
          )
        }),
        ReceiveSelect: vi.fn((params, callback) => {
          callback({}, 200)
        }),
      })),
    },
  }
})

describe('kavenegar/client - Configuration', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearKavenegarClient()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key]
    })
    clearKavenegarClient()
  })

  describe('getKavenegarConfig', () => {
    it('should return config from environment', () => {
      const config = getKavenegarConfig()
      expect(config.apiKey).toBe(mockEnv.KAVENEGAR_API_KEY)
      expect(config.sender).toBe(mockEnv.KAVENEGAR_SENDER)
      expect(config.isDevelopment).toBe(true)
    })

    it('should have default values', () => {
      delete process.env.KAVENEGAR_SENDER
      const config = getKavenegarConfig()
      expect(config.sender).toBe('10004346')
    })

    it('should parse numeric config values', () => {
      process.env.KAVENEGAR_TIMEOUT = '5000'
      process.env.KAVENEGAR_MAX_RETRIES = '5'
      const config = getKavenegarConfig()
      expect(config.timeout).toBe(5000)
      expect(config.maxRetries).toBe(5)
    })
  })
})

describe('kavenegar/client - SMS Sending', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearKavenegarClient()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key]
    })
    clearKavenegarClient()
    vi.clearAllMocks()
  })

  describe('sendSMS', () => {
    it('should send SMS successfully in development mode', async () => {
      const params: SMSParams = {
        message: 'Test message',
        receptor: '09123456789',
      }
      const result = await sendSMS(params)
      expect(result.success).toBe(true)
      expect(result.messageId).toContain('dev-')
      expect(result.status).toBe('queued')
    })

    it('should normalize phone number format', async () => {
      const result = await sendSMS({
        message: 'Test message',
        receptor: '09123456789',
      })
      expect(result.success).toBe(true)
    })

    it('should handle 98XXXXXXXXXX format', async () => {
      const result = await sendSMS({
        message: 'Test message',
        receptor: '989123456789',
      })
      expect(result.success).toBe(true)
    })

    it('should throw error for invalid phone number', async () => {
      await expect(
        sendSMS({
          message: 'Test message',
          receptor: '123',
        })
      ).rejects.toThrow('Invalid phone number format')
    })

    it('should force send in development mode when requested', async () => {
      process.env.NODE_ENV == 'development'
      clearKavenegarClient()

      const result = await sendSMS({
        message: 'Test message',
        receptor: '09123456789',
        forceSend: true,
      })

      expect(result.success).toBe(true)
      expect(result.messageId).not.toContain('dev-')
    })

    it('should include cost in result', async () => {
      process.env.NODE_ENV == 'production'
      clearKavenegarClient()

      const result = await sendSMS({
        message: 'Test message',
        receptor: '09123456789',
      })

      expect(result.success).toBe(true)
      expect(result.cost).toBeDefined()
    })
  })

  describe('sendBulkSMS', () => {
    it('should send bulk SMS successfully', async () => {
      const params: BulkSMSParams = {
        messages: ['Message 1', 'Message 2'],
        receptors: ['09123456789', '09987654321'],
      }
      const result = await sendBulkSMS(params)
      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(2)
      expect(result.sentCount).toBe(2)
      expect(result.failedCount).toBe(0)
    })

    it('should throw error if arrays have different lengths', async () => {
      const params: BulkSMSParams = {
        messages: ['Message 1'],
        receptors: ['09123456789', '09987654321'],
      }
      await expect(sendBulkSMS(params)).rejects.toThrow(
        'Messages and receptors arrays must have the same length'
      )
    })

    it('should validate all phone numbers', async () => {
      const params: BulkSMSParams = {
        messages: ['Message 1', 'Message 2'],
        receptors: ['09123456789', '123'],
      }
      await expect(sendBulkSMS(params)).rejects.toThrow('Invalid phone number format')
    })
  })

  describe('sendOTPSMS', () => {
    it('should send OTP SMS with formatted message', async () => {
      const result = await sendOTPSMS('09123456789', '123456')
      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should include TEST marker in development', async () => {
      process.env.NODE_ENV == 'development'
      clearKavenegarClient()
      const result = await sendOTPSMS('09123456789', '123456')
      expect(result.success).toBe(true)
    })
  })

  describe('sendOTPViaTemplate', () => {
    it('should send OTP via template', async () => {
      const params: OTPTemplateParams = {
        receptor: '09123456789',
        token: '123456',
        template: 'otp-verify',
      }
      const result = await sendOTPViaTemplate(params)
      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should handle development mode', async () => {
      process.env.NODE_ENV == 'development'
      clearKavenegarClient()

      const result = await sendOTPViaTemplate({
        receptor: '09123456789',
        token: '123456',
        template: 'otp-verify',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toContain('dev-template-')
    })

    it('should support multiple tokens', async () => {
      process.env.NODE_ENV == 'production'
      clearKavenegarClient()

      const result = await sendOTPViaTemplate({
        receptor: '09123456789',
        token: '123456',
        token2: 'extra',
        template: 'otp-verify',
      })

      expect(result.success).toBe(true)
    })
  })
})

describe('kavenegar/client - Status & Utilities', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearKavenegarClient()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key]
    })
    clearKavenegarClient()
    vi.clearAllMocks()
  })

  describe('checkSMSStatus', () => {
    it('should check SMS delivery status', async () => {
      process.env.NODE_ENV == 'production'
      clearKavenegarClient()

      const status = await checkSMSStatus('123456')
      expect(status.statusCode).toBe(10)
      expect(status.delivered).toBe(true)
      expect(status.statusText).toBeTruthy()
    })
  })

  describe('getAccountCredit', () => {
    it('should return account credit', async () => {
      process.env.NODE_ENV == 'production'
      clearKavenegarClient()

      const credit = await getAccountCredit()
      expect(credit).toBe(1000000)
    })
  })

  describe('isPhoneBlacklisted', () => {
    it('should return false for non-blacklisted number', async () => {
      process.env.NODE_ENV == 'production'
      clearKavenegarClient()

      const blacklisted = await isPhoneBlacklisted('09123456789')
      expect(blacklisted).toBe(false)
    })
  })
})

describe('kavenegar/client - Error Handling', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearKavenegarClient()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key]
    })
    clearKavenegarClient()
    vi.clearAllMocks()
  })

  it('should throw error when API key is missing', async () => {
    delete process.env.KAVENEGAR_API_KEY
    clearKavenegarClient()

    await expect(
      sendSMS({
        message: 'Test',
        receptor: '09123456789',
      })
    ).rejects.toThrow('KAVENEGAR_API_KEY is not defined')
  })
})

describe('kavenegar/client - Phone Number Validation', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearKavenegarClient()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should accept 09XXXXXXXXX format', async () => {
    const result = await sendSMS({
      message: 'Test',
      receptor: '09123456789',
    })
    expect(result.success).toBe(true)
  })

  it('should accept 98XXXXXXXXXX format', async () => {
    const result = await sendSMS({
      message: 'Test',
      receptor: '989123456789',
    })
    expect(result.success).toBe(true)
  })

  it('should accept XXXXXXXXXX format (10 digits)', async () => {
    const result = await sendSMS({
      message: 'Test',
      receptor: '9123456789',
    })
    expect(result.success).toBe(true)
  })

  it('should handle spaces and dashes', async () => {
    const result = await sendSMS({
      message: 'Test',
      receptor: '0912-345-6789',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid formats', async () => {
    await expect(
      sendSMS({
        message: 'Test',
        receptor: '123',
      })
    ).rejects.toThrow('Invalid phone number format')

    await expect(
      sendSMS({
        message: 'Test',
        receptor: 'abc',
      })
    ).rejects.toThrow()
  })
})