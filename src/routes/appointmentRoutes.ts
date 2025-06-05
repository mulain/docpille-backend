import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate, requireDoctor } from '../middleware/authGuard'
import { appointmentController } from '../controllers/appointmentController'

const router = Router()

// List all appointments (optionally filter by doctor, patient, date, etc.)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // TODO: Implement list appointments
    res.status(501).json({ message: 'List appointments not implemented' })
  })
)

// List available appointments for a doctor in a time range
router.get('/available', authenticate, asyncHandler(appointmentController.available))

// List doctor's appointments
router.get('/doctor', authenticate, requireDoctor, asyncHandler(appointmentController.listSlots))

// Get appointment by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    // TODO: Implement get appointment by id
    res.status(501).json({ message: 'Get appointment not implemented' })
  })
)

router.post('/', authenticate, requireDoctor, asyncHandler(appointmentController.createSlots))

// Update an appointment by ID
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    // TODO: Implement update appointment
    res.status(501).json({ message: 'Update appointment not implemented' })
  })
)

// Delete an appointment by ID
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    // TODO: Implement delete appointment
    res.status(501).json({ message: 'Delete appointment not implemented' })
  })
)

export default router
