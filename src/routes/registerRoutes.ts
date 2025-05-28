import { Router } from 'express'

// local imports
import { registerController } from '../controllers/registerController'
import { asyncHandler } from '../middleware/asyncHandler'
import { emailVerificationLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post('/', asyncHandler(registerController.register))

router.get('/verify-email', emailVerificationLimiter, asyncHandler(registerController.verifyEmail))

router.post(
  '/resend-verification',
  emailVerificationLimiter,
  asyncHandler(registerController.resendVerification)
)

export default router
