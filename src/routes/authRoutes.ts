import { Router } from 'express'

// local imports
import { authController } from '../controllers/authController'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    await authController.login(req)
  })
)

// TODO: Implement refresh token
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    // TODO: Implement refresh token logic
    res.status(501).json({ message: 'Token refresh not implemented yet' })
  })
)

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    await authController.forgotPassword(req)
  })
)

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    await authController.resetPassword(req)
  })
)

export default router
