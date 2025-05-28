import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate } from '../middleware/authenticate'
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

// Get appointment by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    // TODO: Implement get appointment by id
    res.status(501).json({ message: 'Get appointment not implemented' })
  })
)

// Create a new appointment
router.post(
  '/',
  asyncHandler(async (req, res) => {
    // TODO: Implement create appointment
    res.status(501).json({ message: 'Create appointment not implemented' })
  })
)

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

// List available appointments for a doctor in a time range
router.get('/available', authenticate, asyncHandler(appointmentController.available))

export default router
