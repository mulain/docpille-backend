import { Request, Response } from 'express'

// local imports
import { authService } from '../services/authService'
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validations'

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body)
    const result = await authService.login(email, password)
    res.json(result)
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(email)
    res.json({
      message: 'If an account exists with this email, you will receive a password reset link',
    })
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = resetPasswordSchema.parse(req.body)
    await authService.resetPassword(token, password)
    res.json({ message: 'Password has been reset successfully' })
  },
}
// TODO: Implement refresh token
