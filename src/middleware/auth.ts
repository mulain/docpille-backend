import { Request, Response, NextFunction } from 'express'

// local imports
import { UnauthorizedError } from '../utils/errors'
import { verifyToken } from '../utils/auth'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token

  if (!token) {
    throw new UnauthorizedError('No token provided')
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    throw new UnauthorizedError('Invalid token')
  }
}
