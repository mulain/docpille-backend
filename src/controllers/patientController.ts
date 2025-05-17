import { Request, Response } from 'express'
import { PatientService, patientSchema } from '../services/patientService'
//import { UnauthorizedError } from '../utils/errors'

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

  // Verify email
  verifyEmail: async (req: Request, res: Response) => {
    const { token } = req.query

    if (typeof token !== 'string') {
      res.status(400).json({ message: 'Invalid verification token' })
      return
    }

    await patientService.verifyEmail(token)
    res.json({ message: 'Email verified successfully. You can now log in.' })
  },
}
