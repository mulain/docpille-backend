import { UserRole } from './user'

export interface JwtPayload {
  id: string
  email: string
  role: UserRole
}

export interface AuthUser {
  id: string
  email: string
  password: string // This will be hashed
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
