import { Request } from 'express'
import { z } from 'zod'
import { authService } from '../services/authService'

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(val => val.trim().toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(val => val.trim().toLowerCase()),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const authController = {
  async login(req: Request) {
    const { email, password } = loginSchema.parse(req.body)
    return authService.login(email, password)
  },

  async forgotPassword(req: Request) {
    const { email } = forgotPasswordSchema.parse(req.body)
    return authService.forgotPassword(email)
  },

  async resetPassword(req: Request) {
    const { token, password } = resetPasswordSchema.parse(req.body)
    return authService.resetPassword(token, password)
  },
}
// TODO: Implement refresh token
