import { Patient as PatientEntity } from '../entities/Patient'
import { z } from 'zod'

// API response type (omitting sensitive fields)
export type Patient = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: string | null
  email: string
  phoneNumber?: string | null
  address?: string | null
  isEmailVerified: boolean
  verifiedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// Validation schema for patient creation/update
export const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
})

export type CreatePatientDTO = z.infer<typeof patientSchema>
export type UpdatePatientDTO = Partial<CreatePatientDTO>
