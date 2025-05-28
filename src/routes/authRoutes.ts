import { Router } from 'express'

// local imports
import { authController } from '../controllers/authController'
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate } from '../middleware/authenticate'

const router = Router()

router.post('/login', asyncHandler(authController.login))

// TODO: Implement refresh token
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    // TODO: Implement refresh token logic
    res.status(501).json({ message: 'Token refresh not implemented yet' })
  })
)

router.post('/forgot-password', asyncHandler(authController.forgotPassword))

router.post('/reset-password', asyncHandler(authController.resetPassword))

router.get('/me', authenticate, asyncHandler(authController.getCurrentUser))

router.post('/logout', asyncHandler(authController.logout))

export default router
