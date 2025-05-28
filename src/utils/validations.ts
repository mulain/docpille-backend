import { z } from 'zod'

// basic validators
export const uuidSchema = z.string().uuid({ message: 'Must be a valid UUID' })

export const utcDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, {
    message: 'Must be a valid ISO datetime string in UTC (e.g. 2025-05-28T10:00:00Z)',
  })
  .refine(val => !isNaN(Date.parse(val)), { message: 'Must be a valid date' })
  .transform(val => new Date(val))

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform(val => val.trim().toLowerCase())

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')

// endpoint validators
export const availableAppointmentsQuerySchema = z.object({
  doctorId: uuidSchema,
  after: utcDateSchema,
  before: utcDateSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
})
