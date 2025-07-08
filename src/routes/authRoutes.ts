import { Router } from 'express'

// local imports
import { asyncHandler } from '../middleware/asyncHandler'
import { authController } from '../controllers/authController'

const router = Router()

// Login
router.post('/login', asyncHandler(authController.login))

// Logout
router.post('/logout', asyncHandler(authController.logout))

// Forgot password
router.post('/forgot-password', asyncHandler(authController.forgotPassword))

// Check if password reset token is valid
router.get('/is-password-reset-token-valid', asyncHandler(authController.isPasswordResetTokenValid))

// Reset password
router.post('/reset-password', asyncHandler(authController.resetPassword))

// TODO: Implement refresh token
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    // TODO: Implement refresh token logic
    res.status(501).json({ message: 'Token refresh not implemented yet' })
  })
)

export default router
