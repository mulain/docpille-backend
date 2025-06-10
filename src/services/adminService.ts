import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import { CreateDoctorDTO, EditDoctorDTO } from '@m-oss/types'

// local imports
import { hashPassword, generateRandomToken } from '../utils/auth'
import { db } from '../db'
import { doctors, users } from '../db/schema'
import { logger } from '../utils/logger'
import { emailService } from './emailService'
import { InsertDoctor, InsertUser } from '../types/user'

// errors
import { EmailExistsError, NotFoundError } from '../utils/errors'

export const adminService = {
  async createDoctor(data: CreateDoctorDTO) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (existingUser) {
      logger.error('Email already registered', { email: data.email })
      throw new EmailExistsError()
    }

    const rawPassword = crypto.randomBytes(32).toString('hex')
    const passwordHash = await hashPassword(rawPassword)

    const resetToken = generateRandomToken()
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const doctor = await db.transaction(async tx => {
      const newUser: InsertUser = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: 'DOCTOR',
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      }

      const [user] = await tx.insert(users).values(newUser).returning()

      const newDoctor: InsertDoctor = {
        userId: user.id,
        specialization: data.specialization,
      }

      const [createdDoctor] = await tx.insert(doctors).values(newDoctor).returning()

      await emailService.sendDoctorInviteEmail(user.email, resetToken, user.firstName)

      logger.info('Doctor created', { userId: user.id })

      return createdDoctor
    })

    return doctor
  },

  async inactivateDoctor(doctorId: string) {
    const [doctor] = await db
      .update(doctors)
      .set({ active: false })
      .where(eq(doctors.id, doctorId))
      .returning()

    if (!doctor) {
      logger.error('Doctor not found for inactivation', { doctorId })
      throw new NotFoundError('Doctor not found')
    }
    logger.info('Doctor inactivated', { doctorId })
    return doctor
  },

  async activateDoctor(doctorId: string) {
    const [doctor] = await db
      .update(doctors)
      .set({ active: true })
      .where(eq(doctors.id, doctorId))
      .returning()

    if (!doctor) {
      logger.error('Doctor not found for activation', { doctorId })
      throw new NotFoundError('Doctor not found')
    }
    logger.info('Doctor activated', { doctorId })
    return doctor
  },

  async editDoctor(doctorId: string, data: EditDoctorDTO) {
    const doctorToUpdate = await db.query.doctors.findFirst({ where: eq(doctors.id, doctorId) })
    if (!doctorToUpdate) {
      logger.error('Doctor not found for edit', { doctorId })
      throw new NotFoundError('Doctor not found')
    }

    const userUpdateData: Partial<InsertUser> = {}
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName
    if (data.phoneNumber !== undefined) userUpdateData.phoneNumber = data.phoneNumber
    if (data.address !== undefined) userUpdateData.address = data.address

    const doctorUpdateData: Partial<InsertDoctor> = {}
    if (data.specialization !== undefined) doctorUpdateData.specialization = data.specialization
    if (data.active !== undefined) doctorUpdateData.active = data.active

    if (Object.keys(userUpdateData).length === 0 && Object.keys(doctorUpdateData).length === 0) {
      logger.info('No changes provided for doctor edit', { doctorId })
      return doctorToUpdate
    }

    let finalDoctor = doctorToUpdate
    await db.transaction(async tx => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.update(users).set(userUpdateData).where(eq(users.id, doctorToUpdate.userId))
      }

      if (Object.keys(doctorUpdateData).length > 0) {
        const [updatedDoctor] = await tx
          .update(doctors)
          .set(doctorUpdateData)
          .where(eq(doctors.id, doctorId))
          .returning()
        finalDoctor = updatedDoctor
      }
    })

    logger.info('Doctor edited', { doctorId })
    return finalDoctor
  },
}
