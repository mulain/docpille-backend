import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// local imports
import { hashPassword, generateRandomToken } from '../utils/auth'
import { db } from '../db'
import { doctors, users } from '../db/schema'
import { logger } from '../utils/logger'
import { emailService } from './emailService'

// dto
import { CreateDoctorDTO } from '../utils/validations'

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

    const randomPassword = crypto.randomBytes(32).toString('hex')
    const passwordHash = await hashPassword(randomPassword)

    const resetToken = generateRandomToken()
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const [user] = await db
      .insert(users)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: 'DOCTOR',
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      })
      .returning()

    try {
      const [doctor] = await db
        .insert(doctors)
        .values({
          userId: user.id,
          specialization: data.specialization,
        })
        .returning()

      await emailService.sendDoctorInviteEmail(user.email, resetToken, user.firstName)

      logger.info('Doctor created', { userId: user.id })

      return doctor
    } catch (error) {
      logger.error('Failed to create doctor', { userId: user.id })
      await db.delete(users).where(eq(users.id, user.id))
      throw error
    }
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
}
