import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

// local imports
import { logger } from '../utils/logger'
import { AppError } from '../utils/errors'

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  })

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
