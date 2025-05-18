import { Request, Response } from 'express'

// local imports
import { PatientService } from '../services/patientService'
import { patientSchema } from '../types/patient'
import { BadRequestError } from '../utils/errors'

const patientService = new PatientService()

export const patientController = {
  // Patient self-registration
  registerPatient: async (req: Request, res: Response) => {
    const data = patientSchema.parse(req.body)
    const patient = await patientService.registerPatient(data)
    res.status(201).json({
      ...patient,
      message: 'Registration successful. Please check your email to verify your account.',
    })
  },

  verifyEmail: async (req: Request, res: Response) => {
    const { token } = req.query

    if (typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid verification token' })
      return
    }

    try {
      const result = await patientService.verifyEmail(token)
      res.json(result)
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message })
      } else {
        res.status(500).json({ success: false, message: 'Verification failed' })
      }
    }
  },

  resendVerificationEmail: async (req: Request, res: Response) => {
    const { email } = req.body

    if (typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Email is required' })
      return
    }

    try {
      const result = await patientService.resendVerificationToken(email)
      res.json(result)
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message })
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to resend verification email',
        })
      }
    }
  },
}
