import { Router } from 'express'

// local imports
import { authController } from '../controllers/authController'
import { logger } from '../utils/logger'
import { asyncHandler } from '../utils/asyncHandler'
import { BadRequestError } from '../utils/errors'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    logger.info('Login attempt', { email: req.body.email })
    try {
      const result = await authController.login(req)
      res.json(result)
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ message: error.message })
      } else {
        logger.error('Unexpected error during login', { error })
        res.status(500).json({ message: 'An unexpected error occurred' })
      }
    }
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
