import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { doctors, users } from '../db/schema'
import { ForbiddenError } from '../utils/errors'

export const doctorService = {
  async getAllDoctors() {
    const result = await db
      .select({
        id: doctors.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        specialization: doctors.specialization,
        phoneNumber: users.phoneNumber,
        address: users.address,
        active: doctors.active,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .orderBy(users.lastName, users.firstName)

    return result
  },

  async getActiveDoctors() {
    const result = await db
      .select({
        id: doctors.id,
        firstName: users.firstName,
        lastName: users.lastName,
        specialization: doctors.specialization,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.active, true))
      .orderBy(users.lastName, users.firstName)

    return result
  },

  async assertIsDoctor(userId: string) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    })

    if (!doctor) {
      throw new ForbiddenError('User is not a doctor')
    }

    return doctor
  },
}
