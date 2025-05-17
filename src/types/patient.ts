import { Patient as PatientEntity } from '../entities/Patient'
import { z } from 'zod'

// API response type (omitting sensitive fields)
export type Patient = Omit<
  PatientEntity,
  'passwordHash' | 'emailVerificationToken' | 'emailVerificationExpires'
> & {
  verifiedAt?: Date | null
}

// Validation schema for patient creation/update
export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  address: z.string().optional(),
})

export type CreatePatientDTO = z.infer<typeof patientSchema>
export type UpdatePatientDTO = Partial<CreatePatientDTO>
