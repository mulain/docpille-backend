import { Request } from 'express'

// local imports
import { authService } from '../services/authService'
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validations'

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
