import { UserRole } from './auth'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: UserRole
        entityId?: string
      }
    }
  }
}
