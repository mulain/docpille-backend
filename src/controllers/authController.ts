import { Request, Response } from 'express'

// local imports
import { authService } from '../services/authService'
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validations'
import { UnauthorizedError } from '../utils/errors'

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body)
    const { user, token } = await authService.login(email, password)

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    res.json({ user })
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token')
    res.json({ message: 'Logged out' })
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

/*   async refreshToken(req: Request, res: Response) {
    const { token } = req.body
    const { user, token: newToken } = await authService.refreshToken(token)
    res.json({ user, token: newToken })
  }, */
}
