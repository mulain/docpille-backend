import { Router } from 'express'

// local imports
import { registerController } from '../controllers/registerController'
import { asyncHandler } from '../utils/asyncHandler'
import { emailVerificationLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post(
  '/',
  asyncHandler(async (req, res) => {
    await registerController.register(req, res)
  })
)

router.get(
  '/verify-email',
  emailVerificationLimiter,
  asyncHandler(async (req, res) => {
    await registerController.verifyEmail(req, res)
  })
)

router.post(
  '/resend-verification',
  emailVerificationLimiter,
  asyncHandler(async (req, res) => {
    await registerController.resendVerification(req, res)
  })
)

export default router
