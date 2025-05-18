import { Router } from 'express'

// local imports
import { patientController } from '../controllers/patientController'
import { asyncHandler } from '../utils/asyncHandler'
import { emailVerificationLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post('/register', asyncHandler(patientController.registerPatient))
router.get('/verify-email', emailVerificationLimiter, asyncHandler(patientController.verifyEmail))
router.post(
  '/resend-verification',
  emailVerificationLimiter,
  asyncHandler(patientController.resendVerificationEmail)
)

export default router
