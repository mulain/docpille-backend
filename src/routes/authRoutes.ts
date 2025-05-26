import { Router } from 'express'

// local imports
import { authController } from '../controllers/authController'
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    await authController.login(req, res)
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
    await authController.forgotPassword(req, res)
  })
)

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    await authController.resetPassword(req, res)
  })
)

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    await authController.getCurrentUser(req, res)
  })
)

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    await authController.logout(req, res)
  })
)

export default router
