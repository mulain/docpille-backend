import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { users, patients, userRoleEnum } from '../db/schema'
import { hashPassword, generateEmailVerificationToken } from '../utils/auth'
import { logger } from '../utils/logger'
import { emailService } from '../services/emailService'
import { CreatePatientDTO } from '../types/patient'
import {
  EmailExistsError,
  InvalidVerificationTokenError,
  ExpiredVerificationTokenError,
  UserNotFoundError,
  EmailAlreadyVerifiedError,
} from '../utils/errors'

export const registerService = {
  async registerPatient(data: CreatePatientDTO) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (existingUser) {
      logger.error('Email already registered', { email: data.email })
      throw new EmailExistsError()
    }

    const verificationToken = generateEmailVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: await hashPassword(data.password),
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        role: 'PATIENT' as (typeof userRoleEnum.enumValues)[number],
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .returning()

    const [patient] = await db
      .insert(patients)
      .values({
        userId: user.id,
        dateOfBirth: data.dateOfBirth,
      })
      .returning()

    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName)

    logger.info('Patient registered', { email: user.email })
    return { user, patient }
  },

  async verifyEmail(token: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.emailVerificationToken, token),
    })

    if (!user) {
      throw new InvalidVerificationTokenError()
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new ExpiredVerificationTokenError()
    }

    await db
      .update(users)
      .set({
        isEmailVerified: true,
        verifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      })
      .where(eq(users.id, user.id))

    logger.info('Email verified', { email: user.email })
    return { message: 'Email verified successfully' }
  },

  async resendVerificationToken(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    if (user.isEmailVerified) {
      throw new EmailAlreadyVerifiedError()
    }

    const verificationToken = generateEmailVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .where(eq(users.id, user.id))

    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName)

    logger.info('Verification token resent', { email: user.email })
    return { message: 'Verification email sent' }
  },
}
