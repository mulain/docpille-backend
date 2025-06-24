import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { users } from '../db/schema'
import { generateToken, hashPassword, comparePasswords, generateRandomToken } from '../utils/auth'
import { prepareUserResponse } from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  UnauthorizedError,
  InvalidPasswordResetTokenError,
  ExpiredPasswordResetTokenError,
} from '../utils/errors'
import { emailService } from './emailService'

export const authService = {
  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      logger.info('Login attempt with non-existent email', { email })
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValidPassword = await comparePasswords(password, user.passwordHash)
    if (!isValidPassword) {
      logger.info('Login attempt with invalid password', { email })
      throw new UnauthorizedError('Invalid email or password')
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in')
    }

    const token = generateToken(user.id, user.email, user.role)

    logger.info('Login successful', { email })
    return {
      token,
      user: prepareUserResponse(user),
    }
  },

  async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      logger.info('Email not found', { email })
      return
    }

    const resetToken = generateRandomToken()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      })
      .where(eq(users.id, user.id))

    await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName)

    logger.info('Password reset email sent', { email: user.email })
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.passwordResetToken, token),
    })

    if (!user) {
      throw new InvalidPasswordResetTokenError()
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new ExpiredPasswordResetTokenError()
    }

    // TODO: change this to its own route
    // Currently, signing up doctors uses this route, so we need to verify the email
    if (!user.isEmailVerified) {
      await db
        .update(users)
        .set({
          isEmailVerified: true,
          verifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationExpires: null,
        })
        .where(eq(users.id, user.id))
    }

    await db
      .update(users)
      .set({
        passwordHash: await hashPassword(newPassword),
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, user.id))

    logger.info('Password reset successful', { email: user.email })
  },
}
