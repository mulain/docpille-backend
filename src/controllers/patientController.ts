import { Request, Response } from 'express'
import { patientService } from '../services/patientService'
import { BadRequestError, UnauthorizedError } from '../utils/errors'
import { UserRole } from '../types/user'
import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const patients = await patientService.getAllPatients(req.user!)
    res.json(patients)
  })
)

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const patient = await patientService.getPatientById(req.params.id, req.user!)
    res.json(patient)
  })
)

router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const patient = await patientService.updatePatient(req.params.id, req.body, req.user!)
    res.json(patient)
  })
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await patientService.deletePatient(req.params.id, req.user!)
    res.json({ message: 'Patient deleted successfully' })
  })
)

router.get(
  '/:id/appointments',
  authenticate,
  asyncHandler(async (req, res) => {
    const appointments = await patientService.getPatientAppointments(req.params.id, req.user!)
    res.json(appointments)
  })
)

export default router
