// src/shared/lib/kavenegar/client.ts

import Kavenegar from 'kavenegar'
import type {
  KavenegarConfig,
  SMSResult,
  SMSParams,
  BulkSMSParams,
  BulkSMSResult,
  SMSStatus,
  OTPTemplateParams,
  KavenegarAPIResponse,
  KavenegarStatusResponse,
} from './types'
import {
  getKavenegarErrorMessage,
  getSMSStatusMessage,
  isKavenegarError,
  SMSStatusCode,
} from './types'

/**
 * Kavenegar SMS Client
 * Handles SMS sending via Kavenegar API
 */

// Type for Kavenegar client instance
type KavenegarClient = ReturnType<typeof Kavenegar.KavenegarApi>

let kavenegarClient: KavenegarClient | null = null

/**
 * Logger function (can be replaced with proper logging service)
 */
function log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[Kavenegar ${level.toUpperCase()}] ${timestamp}:`
  
  if (level === 'error') {
    console.error(prefix, message, data || '')
  } else if (level === 'warn') {
    console.warn(prefix, message, data || '')
  } else {
    console.log(prefix, message, data || '')
  }
}

/**
 * Initialize Kavenegar Client
 * Creates singleton instance with API key from environment
 */
function getKavenegarClient(): KavenegarClient {
  if (kavenegarClient) {
    return kavenegarClient
  }

  const apiKey = process.env.KAVENEGAR_API_KEY

  if (!apiKey) {
    throw new Error('KAVENEGAR_API_KEY is not defined in environment variables')
  }

  kavenegarClient = Kavenegar.KavenegarApi({
    apikey: apiKey,
  })

  return kavenegarClient
}

/**
 * Clear Kavenegar client (useful for testing)
 */
export function clearKavenegarClient(): void {
  kavenegarClient = null
}

/**
 * Get Kavenegar Configuration from Environment
 */
export function getKavenegarConfig(): KavenegarConfig {
  return {
    apiKey: process.env.KAVENEGAR_API_KEY || '',
    sender: process.env.KAVENEGAR_SENDER || '10004346',
    isDevelopment: process.env.NODE_ENV === 'development',
    timeout: parseInt(process.env.KAVENEGAR_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.KAVENEGAR_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.KAVENEGAR_RETRY_DELAY || '1000', 10),
  }
}

/**
 * Validate phone number format
 * Ensures it's in 98XXXXXXXXXX format
 */
function validatePhoneNumber(phone: string): string {
  // Remove any spaces or dashes
  const cleaned = phone.replace(/[\s\-]/g, '')
  
  // Check if it starts with 98 and has correct length
  if (cleaned.startsWith('98') && cleaned.length === 12) {
    return cleaned
  }
  
  // If starts with 0, convert to 98 format
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '98' + cleaned.slice(1)
  }
  
  // If just 10 digits, assume it's without leading 0
  if (cleaned.length === 10) {
    return '98' + cleaned
  }
  
  throw new Error(`Invalid phone number format: ${phone}. Expected 98XXXXXXXXXX`)
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper for async functions
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error
      }
      
      // Only retry if not the last attempt
      if (attempt < maxRetries - 1) {
        log('warn', `Attempt ${attempt + 1} failed, retrying...`, error.message)
        await sleep(delay * (attempt + 1)) // Exponential backoff
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed')
}

/**
 * Send SMS via Kavenegar
 * Wrapper around Kavenegar.Send with proper error handling
 * 
 * @param params - SMS parameters (message, receptor, sender)
 * @returns Promise with SMS result
 */
export async function sendSMS(params: SMSParams): Promise<SMSResult> {
  const config = getKavenegarConfig()
  
  // Validate phone number
  const receptor = validatePhoneNumber(params.receptor)

  // In development, log but don't actually send (unless forced)
  if (config.isDevelopment && !params.forceSend) {
    log('info', 'DEV MODE: SMS would be sent', {
      to: receptor,
      message: params.message,
      sender: params.sender || config.sender,
    })

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
      status: 'queued',
      message: 'Development mode - SMS not actually sent',
    }
  }

  const client = getKavenegarClient()

  // Send SMS with retry
  return withRetry(
    () =>
      new Promise<SMSResult>((resolve, reject) => {
        const sendParams = {
          message: params.message,
          sender: params.sender || config.sender,
          receptor,
          ...(params.date && { date: params.date }),
          ...(params.type && { type: params.type }),
        }

        client.Send(sendParams, (response: KavenegarAPIResponse, status: number) => {
          log('info', 'Kavenegar API Response', { status, response })

          // Success
          if (status === 200 && response?.return) {
            const smsData = response.return[0]
            resolve({
              success: true,
              messageId: String(smsData.messageid),
              status: getSMSStatusMessage(smsData.status),
              message: 'SMS sent successfully',
              cost: smsData.cost,
            })
          }
          // Error
          else {
            const errorMsg = getKavenegarErrorMessage(status)
            reject(new Error(`Kavenegar API error (${status}): ${errorMsg}`))
          }
        })
      }),
    config.maxRetries,
    config.retryDelay
  ).catch((error: Error) => {
    log('error', 'Failed to send SMS', error)
    return {
      success: false,
      status: 'failed',
      message: 'Failed to send SMS',
      error: error.message,
    }
  })
}

/**
 * Send Bulk SMS
 * Send multiple messages to multiple recipients
 * 
 * @param params - Bulk SMS parameters
 * @returns Promise with bulk SMS result
 */
export async function sendBulkSMS(params: BulkSMSParams): Promise<BulkSMSResult> {
  const config = getKavenegarConfig()

  if (params.messages.length !== params.receptors.length) {
    throw new Error('Messages and receptors arrays must have the same length')
  }

  // Validate all phone numbers
  const receptors = params.receptors.map(validatePhoneNumber)

  // In development mode
  if (config.isDevelopment && !params.forceSend) {
    log('info', 'DEV MODE: Bulk SMS would be sent', {
      count: params.messages.length,
      receptors,
    })

    return {
      success: true,
      results: params.messages.map((_, i) => ({
        success: true,
        messageId: `dev-bulk-${Date.now()}-${i}`,
        status: 'queued',
        message: 'Development mode - SMS not actually sent',
      })),
      sentCount: params.messages.length,
      failedCount: 0,
    }
  }

  const client = getKavenegarClient()

  return withRetry(
    () =>
      new Promise<BulkSMSResult>((resolve, reject) => {
        const sendParams = {
          message: params.messages,
          sender: Array(params.messages.length).fill(params.sender || config.sender),
          receptor: receptors,
        }

        client.Send(sendParams, (response: KavenegarAPIResponse, status: number) => {
          log('info', 'Kavenegar Bulk API Response', { status, response })

          if (status === 200 && response?.return) {
            const results = response.return.map(smsData => ({
              success: true,
              messageId: String(smsData.messageid),
              status: getSMSStatusMessage(smsData.status),
              message: 'SMS sent successfully',
              cost: smsData.cost,
            }))

            const totalCost = response.return.reduce((sum, sms) => sum + sms.cost, 0)

            resolve({
              success: true,
              results,
              sentCount: results.length,
              failedCount: 0,
              totalCost,
            })
          } else {
            const errorMsg = getKavenegarErrorMessage(status)
            reject(new Error(`Kavenegar Bulk API error (${status}): ${errorMsg}`))
          }
        })
      }),
    config.maxRetries,
    config.retryDelay
  ).catch((error: Error) => {
    log('error', 'Failed to send bulk SMS', error)
    return {
      success: false,
      results: [],
      sentCount: 0,
      failedCount: params.messages.length,
    }
  })
}

/**
 * Send OTP SMS
 * Specialized function for sending OTP codes
 * 
 * @param phoneNumber - Receptor phone number (98XXXXXXXXXX format)
 * @param otpCode - 6-digit OTP code
 * @returns Promise with SMS result
 */
export async function sendOTPSMS(
  phoneNumber: string,
  otpCode: string
): Promise<SMSResult> {
  const config = getKavenegarConfig()

  const message = `کد تایید شما: ${otpCode}\nاعتبار: 2 دقیقه${
    config.isDevelopment ? '\n[TEST]' : ''
  }`

  return sendSMS({
    receptor: phoneNumber,
    message,
    sender: config.sender,
  })
}

/**
 * Send OTP via Kavenegar Template (Lookup)
 * Uses Kavenegar's template feature for better delivery
 * You need to create a template in Kavenegar dashboard first
 * 
 * @param params - Template parameters
 * @returns Promise with SMS result
 */
export async function sendOTPViaTemplate(
  params: OTPTemplateParams
): Promise<SMSResult> {
  const config = getKavenegarConfig()
  
  // Validate phone number
  const receptor = validatePhoneNumber(params.receptor)

  // In development mode
  if (config.isDevelopment) {
    log('info', 'DEV MODE: Template SMS would be sent', {
      to: receptor,
      template: params.template,
      token: params.token,
    })

    return {
      success: true,
      messageId: `dev-template-${Date.now()}`,
      status: 'queued',
      message: 'Development mode - Template SMS not actually sent',
    }
  }

  const client = getKavenegarClient()

  return withRetry(
    () =>
      new Promise<SMSResult>((resolve, reject) => {
        const lookupParams = {
          receptor,
          token: params.token,
          template: params.template,
          ...(params.token2 && { token2: params.token2 }),
          ...(params.token3 && { token3: params.token3 }),
          ...(params.token10 && { token10: params.token10 }),
          ...(params.token20 && { token20: params.token20 }),
          ...(params.type && { type: params.type }),
        }

        client.VerifyLookup(lookupParams, (response: KavenegarAPIResponse, status: number) => {
          log('info', 'Kavenegar Template Response', { status, response })

          if (status === 200 && response?.return) {
            resolve({
              success: true,
              messageId: String(response.return[0].messageid),
              status: 'sent',
              message: 'Template SMS sent successfully',
              cost: response.return[0].cost,
            })
          } else {
            const errorMsg = getKavenegarErrorMessage(status)
            reject(new Error(`Kavenegar template error (${status}): ${errorMsg}`))
          }
        })
      }),
    config.maxRetries,
    config.retryDelay
  ).catch((error: Error) => {
    log('error', 'Failed to send template SMS', error)
    return {
      success: false,
      status: 'failed',
      message: 'Failed to send template SMS',
      error: error.message,
    }
  })
}

/**
 * Check SMS Delivery Status
 * Query Kavenegar for message delivery status
 * 
 * @param messageId - Message ID returned from send
 * @returns Promise with delivery status
 */
export async function checkSMSStatus(messageId: string): Promise<SMSStatus> {
  const client = getKavenegarClient()

  return new Promise((resolve, reject) => {
    client.Status(
      { messageid: messageId },
      (response: KavenegarStatusResponse, status: number) => {
        log('info', 'Kavenegar Status Response', { status, response })

        if (status === 200 && response?.return) {
          const statusData = response.return[0]
          resolve({
            statusCode: statusData.status,
            statusText: getSMSStatusMessage(statusData.status),
            delivered: statusData.status === SMSStatusCode.DELIVERED,
          })
        } else {
          const errorMsg = getKavenegarErrorMessage(status)
          reject(new Error(`Failed to check SMS status (${status}): ${errorMsg}`))
        }
      }
    )
  })
}

/**
 * Get account credit
 * Returns remaining credit in Rials
 * 
 * @returns Promise with credit amount
 */
export async function getAccountCredit(): Promise<number> {
  const client = getKavenegarClient()

  return new Promise((resolve, reject) => {
    client.AccountInfo((response: any, status: number) => {
      if (status === 200 && response?.return) {
        resolve(response.return.remaincredit)
      } else {
        const errorMsg = getKavenegarErrorMessage(status)
        reject(new Error(`Failed to get account info (${status}): ${errorMsg}`))
      }
    })
  })
}

/**
 * Check if phone number is in blacklist
 * 
 * @param phoneNumber - Phone number to check
 * @returns Promise with blacklist status
 */
export async function isPhoneBlacklisted(phoneNumber: string): Promise<boolean> {
  const client = getKavenegarClient()
  const receptor = validatePhoneNumber(phoneNumber)

  return new Promise((resolve, reject) => {
    client.ReceiveSelect({ linenumber: receptor }, (response: any, status: number) => {
      if (status === 200) {
        // If we get 200, number is not blacklisted
        resolve(false)
      } else if (status === SMSStatusCode.BLACKLISTED) {
        resolve(true)
      } else {
        const errorMsg = getKavenegarErrorMessage(status)
        reject(new Error(`Failed to check blacklist (${status}): ${errorMsg}`))
      }
    })
  })
}