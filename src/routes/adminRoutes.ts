import { Router } from 'express'

// local imports
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate, requireAdmin } from '../middleware/authGuard'
import { adminController } from '../controllers/adminController'

const router = Router()

router.post('/doctors', authenticate, requireAdmin, asyncHandler(adminController.createDoctor))

router.patch(
  '/doctors/:id/inactivate',
  authenticate,
  requireAdmin,
  asyncHandler(adminController.inactivateDoctor)
)
router.patch(
  '/doctors/:id/activate',
  authenticate,
  requireAdmin,
  asyncHandler(adminController.activateDoctor)
)

router.patch('/doctors/:id', authenticate, requireAdmin, asyncHandler(adminController.editDoctor))

export default router
