import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { z } from 'zod'

// local imports
import { logger } from '../utils/logger'
import { AppError } from '../utils/errors'

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error('AppError occurred', {
      error: err.message,
      statusCode: err.statusCode,
    })
  } else {
    logger.error('Error occurred', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
    })
  }

  if (err instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: err.errors[0].message,
    })
    return
  }

  // Handle our custom AppErrors
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
