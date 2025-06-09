import { Router } from 'express'

// local imports
import { userController } from '../controllers/userController'
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate } from '../middleware/authGuard'

const router = Router()

// Get current user
router.get('/me', authenticate, asyncHandler(userController.getCurrentUser))

// Update user profile
router.patch('/profile', authenticate, asyncHandler(userController.updateProfile))

// Delete user
router.delete('/me', authenticate, asyncHandler(userController.deleteMe))

export default router
