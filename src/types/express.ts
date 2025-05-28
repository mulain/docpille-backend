import { JwtPayload } from './jwtPayload'

declare module 'express' {
  interface Request {
    user?: JwtPayload
  }
}
