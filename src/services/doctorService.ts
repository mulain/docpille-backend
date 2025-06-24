import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { doctors, users } from '../db/schema'
import { ForbiddenError, NotFoundError } from '../utils/errors'

export const doctorService = {
  async assertIsDoctor(userId: string) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    })

    if (!doctor) {
      throw new ForbiddenError('User is not a doctor')
    }

    return doctor
  },

  async getAllDoctors() {
    const allDoctors = await db
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

    return allDoctors
  },

  async getActiveDoctors() {
    const activeDoctors = await db
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

    return activeDoctors
  },

  async getDoctorByUserId(userId: string) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
      columns: {
        id: true,
        specialization: true,
        active: true,
      },
    })
      

    if (!doctor) {
      throw new NotFoundError('Doctor not found')
    }

    return doctor
  },
}
