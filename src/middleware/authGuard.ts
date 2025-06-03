import { Request, Response, NextFunction } from 'express'

// local imports
import { ForbiddenError, UnauthorizedError } from '../utils/errors'
import { verifyToken } from '../utils/auth'

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.token

  if (!token) {
    throw new UnauthorizedError('No token provided')
  }

  try {
    const decoded = verifyToken(token)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch {
    throw new UnauthorizedError('Invalid token')
  }
}

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ForbiddenError()
  }
  next()
}

export const requireDoctor = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'DOCTOR') {
    throw new ForbiddenError()
  }
  next()
}