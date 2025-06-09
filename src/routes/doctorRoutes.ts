import { Router } from 'express'

// local imports
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate, requireAdmin } from '../middleware/authGuard'
import { doctorController } from '../controllers/doctorController'

const router = Router()

// Get all doctors (admin only)
router.get('/', authenticate, requireAdmin, asyncHandler(doctorController.getAllDoctors))

// Get active doctors (public)
router.get('/active', authenticate, asyncHandler(doctorController.getActiveDoctors))

export default router
