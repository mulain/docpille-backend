import { Router } from 'express'

// local imports
import  patientController  from '../controllers/patientController'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

// Protected patient routes will go here
// These routes will require authentication middleware

export default router
