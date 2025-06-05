import { z } from 'zod'

// basic schemas
export const uuidSchema = z.string().uuid({ message: 'Must be a valid UUID' })

export const utcDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, {
    message: 'Must be a valid ISO datetime string in UTC (e.g. 2025-05-28T10:00:00Z)',
  })
  .refine(val => !isNaN(Date.parse(val)), { message: 'Must be a valid date' })
  .transform(val => new Date(val))

const time24HourSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Must be a valid time in 24-hour format (HH:mm)',
})

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform(val => val.trim().toLowerCase())

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long')

export const firstNameSchema = z.string().min(2, 'First name must be at least 2 characters')

export const lastNameSchema = z.string().min(2, 'Last name must be at least 2 characters')

export const specializationSchema = z
  .string()
  .trim()
  .min(2, 'Specialization must be at least 2 characters')
  .or(z.literal('').transform(() => undefined))
  .nullable()
  .optional()

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(2, 'Phone number must be at least 2 characters')
  .or(z.literal('').transform(() => undefined))
  .nullable()
  .optional()

export const addressSchema = z
  .string()
  .trim()
  .min(2, 'Address must be at least 2 characters')
  .or(z.literal('').transform(() => undefined))
  .nullable()
  .optional()

// combined schemas
export const availableAppointmentsQuerySchema = z.object({
  doctorId: uuidSchema,
  after: utcDateSchema,
  before: utcDateSchema,
})

export const createAppointmentSlotsSchema = z.object({
  slots: z
    .array(
      z.object({
        startTime: utcDateSchema,
        endTime: utcDateSchema,
      })
    )
    .min(1, 'At least one slot must be provided'),
})

export type CreateAppointmentSlotsDTO = z.infer<typeof createAppointmentSlotsSchema>

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
})

export const registerSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export type RegisterDTO = z.infer<typeof registerSchema>

export const createDoctorSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  specialization: specializationSchema,
})

export type CreateDoctorDTO = z.infer<typeof createDoctorSchema>

export const editDoctorSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    specialization: specializationSchema,
    active: z.boolean(),
    phoneNumber: phoneNumberSchema,
    address: addressSchema,
  })
  .partial()

export type EditDoctorDTO = z.infer<typeof editDoctorSchema>
