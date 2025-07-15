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

// List available appointments for a doctor by date range
router.get(
  '/available',
  authenticate,
  asyncHandler(appointmentController.getAvailableSlotsByDoctorId)
)

// List a user's own appointments
router.get('/me', authenticate, asyncHandler(appointmentController.getMySlots))

// Get appointment by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    // TODO: Implement get appointment by id
    res.status(501).json({ message: 'Get appointment not implemented' })
  })
)

// Create one or more appointments
router.post('/', authenticate, requireDoctor, asyncHandler(appointmentController.createSlots))

// Update an appointment by ID
router.put('/:id', authenticate, asyncHandler(appointmentController.updateSlot))

// Book an appointment by ID
router.post('/:id/book', authenticate, asyncHandler(appointmentController.bookSlot))

// Book an appointment by ID with details
router.post(
  '/:id/book-with-details',
  authenticate,
  asyncHandler(appointmentController.bookSlotWithDetails)
)

// Cancel an appointment by ID
router.post('/:id/cancel', authenticate, asyncHandler(appointmentController.cancelSlot))

// Delete an appointment by ID
router.delete('/:id', authenticate, requireDoctor, asyncHandler(appointmentController.deleteSlot))

export default router
