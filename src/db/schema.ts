import { pgTable, uuid, text, timestamp, boolean, pgEnum, jsonb, date } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['PATIENT', 'DOCTOR', 'ADMIN'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phoneNumber: text('phone_number'),
  address: text('address'),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'),
  role: userRoleEnum('role').notNull().default('PATIENT'),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationExpires: timestamp('email_verification_expires', { withTimezone: true }),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires', { withTimezone: true }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  specialization: text('specialization'),
  active: boolean('active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // participants
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'restrict' }),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict' }),

  // timing
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),

  // status
  bookedAt: timestamp('booked_at', { withTimezone: true }),
  reservedUntil: timestamp('reserved_until', { withTimezone: true }),

  // details
  reason: text('reason'),
  patientNotes: text('patient_notes'),
  doctorNotes: text('doctor_notes'),
  videoCall: jsonb('video_call'),

  // metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
