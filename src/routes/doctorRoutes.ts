import { Router } from 'express'

// local imports
import { asyncHandler } from '../middleware/asyncHandler'
import { authenticate } from '../middleware/authGuard'
import { doctorController } from '../controllers/doctorController'

const router = Router()

router.get('/', authenticate, asyncHandler(doctorController.getAllDoctors))

export default router
