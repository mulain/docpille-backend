import { JwtPayload } from './jwtPayload'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// This empty export is needed to make this a module
export {}
