import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { doctors, users } from '../db/schema'

export const doctorService = {
  async getAllDoctors() {
    const result = await db
      .select({
        id: doctors.id,
        firstName: users.firstName,
        lastName: users.lastName,
        specialization: doctors.specialization,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .orderBy(users.lastName, users.firstName)

    return result
  },
}
