import { Router } from 'express'

// local imports
import { asyncHandler } from '../utils/asyncHandler'
import { logger } from '../utils/logger'

const router = Router()

// TODO: Implement login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    logger.info('Login attempt', { email: req.body.email })
    // TODO: Implement login logic
    res.status(501).json({ message: 'Login not implemented yet' })
  })
)

// TODO: Implement refresh token
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    logger.info('Token refresh attempt')
    // TODO: Implement refresh token logic
    res.status(501).json({ message: 'Token refresh not implemented yet' })
  })
)

export default router
