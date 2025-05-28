import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { users } from '../db/schema'
import {
  generateToken,
  hashPassword,
  comparePasswords,
  generateRandomToken,
  prepareUserResponse,
} from '../utils/auth'
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

    const token = generateToken(user.id, user.email, user.role)

    logger.info('Login successful', { email })
    return {
      token,
      user: prepareUserResponse(user),
    }
  },

  async getCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return null
    }

    return prepareUserResponse(user)
  },

  async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      logger.info('Email not found', { email })
      // Not throwing an error to not reveal if email exists
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
