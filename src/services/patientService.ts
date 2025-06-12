import { eq, sql } from 'drizzle-orm'
import type { Patient } from '@m-oss/types'

// local imports
import { db } from '../db'
import { patients, users } from '../db/schema'
import { ForbiddenError, NotFoundError } from '../utils/errors'

export const patientService = {
  async assertIsPatient(userId: string) {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.userId, userId),
    })

    if (!patient) {
      throw new ForbiddenError('User is not a patient')
    }

    return patient
  },

  // TODO: Add pagination, check if ok, just shmanged it down
  async getAllPatients() {
    const result = await db
      .select({
        id: patients.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        address: users.address,
        dateOfBirth: users.dateOfBirth,
        gender: users.gender,
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .orderBy(users.lastName, users.firstName)

    return result
  },

  async getPatientById(patientId: string) {
    const patient = (await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      columns: {
        id: true,
      },
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            address: true,
            dateOfBirth: true,
            gender: true,
          },
          extras: {
            age: sql<number | null>`
              CASE
                WHEN ${users.dateOfBirth} IS NOT NULL
                THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${users.dateOfBirth}))::int
                ELSE NULL
              END
            `,
          },
        },
      },
    })) as Patient | undefined

    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    return patient
  },
}
