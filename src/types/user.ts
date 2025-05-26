import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { users, patients, doctors } from '../db/schema'

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

export type Patient = InferSelectModel<typeof patients>
export type NewPatient = InferInsertModel<typeof patients>

export type Doctor = InferSelectModel<typeof doctors>
export type NewDoctor = InferInsertModel<typeof doctors>

export type UserWithRelations = User & {
  patient?: Patient | null
  doctor?: Doctor | null
}

// API response type (omitting sensitive fields)
export type UserResponse = Omit<User, 'passwordHash'> & {
  patient?: Omit<Patient, 'userId'> | null
  doctor?: Omit<Doctor, 'userId'> | null
}
