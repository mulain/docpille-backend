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

export const authController = {
  async login(req: Request) {
    const { email, password } = loginSchema.parse(req.body)
    return authService.login(email, password)
  },
}
// TODO: Implement refresh token
