import { Router } from 'express'
import { patientController } from '../controllers/patientController'
import { asyncHandler } from '../utils/asyncHandler'
import { emailRateLimiter } from '../services/emailService'

const router = Router()

// Public routes
router.post('/register', asyncHandler(patientController.registerPatient))
router.get('/verify-email', emailRateLimiter, asyncHandler(patientController.verifyEmail))

export default router
