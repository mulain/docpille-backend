import rateLimit from 'express-rate-limit'

// Rate limiter for email verification - 3 attempts per IP per hour
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many email verification attempts. Please try again in an hour.',
})

// Add other rate limiters here as needed
