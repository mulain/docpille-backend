import { Request, Response } from 'express'
import { PatientService } from '../services/patientService'
import { BadRequestError, UnauthorizedError } from '../utils/errors'
import { UserRole } from '../types/auth'

const patientService = new PatientService()

export const patientController = {
  // Get all patients - Only accessible by medical staff
  async getAllPatients(req: Request, res: Response) {
    try {
      const user = req.user as { role: UserRole }
      const patients = await patientService.getAllPatients(user)
      res.json(patients)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(403).json({ success: false, message: error.message })
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch patients' })
      }
    }
  },

  // Get patient by ID - Only accessible by the patient themselves or medical staff
  async getPatientById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = req.user as { role: UserRole; entityId?: string }
      const patient = await patientService.getPatientById(id, user)
      res.json(patient)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(403).json({ success: false, message: error.message })
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch patient' })
      }
    }
  },

  // Update patient - Patients can update their own basic info, medical staff can update everything
  async updatePatient(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = req.user as { role: UserRole; entityId?: string }
      const patient = await patientService.updatePatient(id, req.body, user)
      res.json(patient)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(403).json({ success: false, message: error.message })
      } else if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message })
      } else {
        res.status(500).json({ success: false, message: 'Failed to update patient' })
      }
    }
  },
}
