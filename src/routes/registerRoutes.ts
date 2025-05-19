import { Router } from 'express'

// local imports
import { patientController } from '../controllers/patientController'
import { asyncHandler } from '../utils/asyncHandler'
import { emailVerificationLimiter } from '../middleware/rateLimiter'
import { logger } from '../utils/logger'

const router = Router()

router.post(
  '/',
  asyncHandler(async (req, res) => {
    logger.info('Registration attempt', { email: req.body.email })
    await patientController.registerPatient(req, res)
    logger.info('Registration successful', { email: req.body.email })
  })
)

router.get(
  '/verify-email',
  emailVerificationLimiter,
  asyncHandler(async (req, res) => {
    logger.info('Email verification attempt', { token: req.query.token })
    await patientController.verifyEmail(req, res)
    logger.info('Email verification successful', { token: req.query.token })
  })
)

router.post(
  '/resend-verification',
  emailVerificationLimiter,
  asyncHandler(async (req, res) => {
    logger.info('Resend verification attempt', { email: req.body.email })
    await patientController.resendVerificationEmail(req, res)
    logger.info('Resend verification successful', { email: req.body.email })
  })
)

export default router
