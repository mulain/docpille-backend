import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { patients, users } from '../db/schema'
import { ForbiddenError } from '../utils/errors'

export const patientService = {
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

  async assertIsPatient(userId: string) {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.userId, userId),
    })

    if (!patient) {
      throw new ForbiddenError('User is not a patient')
    }

    return patient
  },
}
