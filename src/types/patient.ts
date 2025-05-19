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
  firstName: z.string().min(1, 'First name must be at least 1 character'),
  lastName: z.string().min(1, 'Last name must be at least 1 character'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type CreatePatientDTO = z.infer<typeof patientSchema>
export type UpdatePatientDTO = Partial<CreatePatientDTO>
