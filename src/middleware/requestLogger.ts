import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  const { method, originalUrl, ip } = req

  logger.info('Incoming request', {
    method,
    url: originalUrl,
    ip,
    userAgent: req.get('user-agent'),
  })

  res.on('finish', () => {
    const duration = Date.now() - start
    const { statusCode } = res

    logger.info('Request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
    })
  })

  next()
}
