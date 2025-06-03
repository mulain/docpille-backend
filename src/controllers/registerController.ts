import { Request, Response } from 'express'
import { z } from 'zod'

// local imports
import { registerService } from '../services/registerService'
import { BadRequestError } from '../utils/errors'
import { emailSchema, registerSchema } from '../utils/validations'

export const registerController = {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body)
    const result = await registerService.registerPatient(data)
    res.status(201).json(result)
  },

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query
    if (typeof token !== 'string') {
      throw new BadRequestError('Invalid verification token')
    }

    await registerService.verifyEmail(token)
    res.json({ message: 'Email verified successfully' })
  },

  async resendVerification(req: Request, res: Response) {
    const email = emailSchema.parse(req.body.email)
    await registerService.resendVerificationToken(email)
    res.json({
      message:
        'If your email is registered and not verified, you will receive a verification email.',
    })
  },
}
