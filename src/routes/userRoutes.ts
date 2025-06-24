import { Router } from 'express'

// local imports
import { userController } from '../controllers/userController'
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate, requireDoctor } from '../middleware/authGuard'

const router = Router()

// Get current user
router.get('/me', authenticate, asyncHandler(userController.getCurrentUser))

// Update the authenticated user's identity fields
router.patch('/me/identity', authenticate, asyncHandler(userController.updateIdentityFields))

// Update the authenticated user's contact fields
router.patch('/me/contact', authenticate, asyncHandler(userController.updateContactFields))

// Update the authenticated user's doctor fields
router.patch('/me/doctor', authenticate, requireDoctor, asyncHandler(userController.updateDoctorFields))

// Delete user
router.delete('/me', authenticate, asyncHandler(userController.deleteMe))

export default router
