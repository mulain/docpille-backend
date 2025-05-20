import { Request, Response } from 'express'
import { z } from 'zod'

// local imports
import { registerService } from '../services/registerService'
import { BadRequestError } from '../utils/errors'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .transform(val => val.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const resendVerificationSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(val => val.toLowerCase()),
})

export const registerController = {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body)
      const result = await registerService.registerPatient(data)
      res.status(201).json(result)
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message })
      } else {
        res.status(500).json({ success: false, message: 'Registration failed' })
      }
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query
      if (typeof token !== 'string') {
        throw new BadRequestError('Invalid verification token')
      }

      await registerService.verifyEmail(token)
      res.json({ success: true, message: 'Email verified successfully' })
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message })
      } else {
        res.status(500).json({ success: false, message: 'Verification failed' })
      }
    }
  },

  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = resendVerificationSchema.parse(req.body)
      await registerService.resendVerificationToken(email)
      res.json({
        message:
          'If your email is registered and not verified, you will receive a verification email.',
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message })
      } else {
        res.status(500).json({ message: 'An error occurred' })
      }
    }
  },
}
