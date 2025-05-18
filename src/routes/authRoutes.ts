import { Router } from 'express'

// local imports
import { patientController } from '../controllers/patientController'
import { asyncHandler } from '../utils/asyncHandler'
import { emailRateLimiter } from '../services/emailService'

const router = Router()

router.post('/register', asyncHandler(patientController.registerPatient))
router.get('/verify-email', emailRateLimiter, asyncHandler(patientController.verifyEmail))
router.post(
  '/resend-verification',
  emailRateLimiter,
  asyncHandler(patientController.resendVerificationEmail)
)

export default router
