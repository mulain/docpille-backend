export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

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
  entityId?: string
  createdAt: Date
  updatedAt: Date
}
