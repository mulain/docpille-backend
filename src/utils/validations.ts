import { z } from 'zod'

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform(val => val.trim().toLowerCase())

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')

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
