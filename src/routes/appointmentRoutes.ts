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

// List available appointments for a doctor by year and month
router.get(
  '/available',
  authenticate,
  asyncHandler(appointmentController.getAvailableSlotsByDoctorId)
)

// List a doctor's own appointments
router.get(
  '/doctor',
  authenticate,
  requireDoctor,
  asyncHandler(appointmentController.getMySlotsDoctor)
)

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

router.delete('/:id', authenticate, requireDoctor, asyncHandler(appointmentController.deleteSlot))

export default router
