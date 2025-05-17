export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  // Add additional claims if needed (e.g., doctorId or patientId based on role)
  entityId?: string // The ID of the doctor/patient this user is associated with
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
