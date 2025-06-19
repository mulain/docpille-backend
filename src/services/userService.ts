import { eq } from 'drizzle-orm'
import { UpdateProfileDoctorDTO, UpdateProfilePatientDTO } from '@m-oss/types'

// local imports
import { db } from '../db'
import { users, doctors } from '../db/schema'
import { prepareUserResponse, hashPassword } from '../utils/auth'
import { stripUndefined } from '../utils/helpers'
import { NotFoundError } from '../utils/errors'

export const userService = {
  async getCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return null
    }

    return prepareUserResponse(user)
  },

  async updateProfilePatient(userId: string, data: UpdateProfilePatientDTO) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    return prepareUserResponse(updatedUser)
  },

  async updateProfileDoctor(userId: string, data: UpdateProfileDoctorDTO) {
    const user = await db.transaction(async tx => {
      if (data.user) {
        const userUpdate: Record<string, any> = {
          ...stripUndefined(data.user),
        }

        if (data.user.password) {
          userUpdate.passwordHash = await hashPassword(data.user.password)
          delete userUpdate.password
        }

        await tx.update(users).set(userUpdate).where(eq(users.id, userId))
      }

      if (data.doctor) {
        const doctorUpdate = {
          ...stripUndefined(data.doctor),
        }

        await tx.update(doctors).set(doctorUpdate).where(eq(doctors.userId, userId))
      }

      const updatedUser = await db.query.users.findFirst({ where: eq(users.id, userId) })

      if (!updatedUser) {
        throw new NotFoundError('User not found')
      }

      return updatedUser
    })

    return prepareUserResponse(user)
  },

  // TODO: Implement delete user
  /*  async deleteMe(userId: string) {
    await db.delete(users).where(eq(users.id, userId))

  }, */
}
