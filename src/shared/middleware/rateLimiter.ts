// src/shared/middleware/rateLimiter.ts

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */
export class RateLimiter {
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (IP, user ID, etc.)
   * @returns true if allowed, false if rate limited
   */
  check(key: string): boolean {
    const now = Date.now()
    const record = store[key]

    // No record or expired - allow request
    if (!record || now > record.resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return true
    }

    // Increment count
    record.count++

    // Check if exceeded
    if (record.count > this.maxRequests) {
      return false
    }

    return true
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const record = store[key]
    if (!record) return this.maxRequests

    const remaining = this.maxRequests - record.count
    return Math.max(0, remaining)
  }

  /**
   * Get reset time
   */
  getResetTime(key: string): number {
    const record = store[key]
    return record?.resetTime || Date.now() + this.windowMs
  }

  /**
   * Reset limit for key
   */
  reset(key: string): void {
    delete store[key]
  }
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}

// Run cleanup every 10 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000)
}