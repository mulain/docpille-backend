import { eq } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { users, userRoleEnum } from '../db/schema'
import { generateToken, hashPassword } from '../utils/auth'
import { comparePasswords } from '../utils/auth'
import { logger } from '../utils/logger'
import { UnauthorizedError, NotFoundError, EmailExistsError } from '../utils/errors'

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
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  },

  async getCurrentUser(userId: string | undefined) {
    if (!userId) {
      throw new UnauthorizedError('Not authenticated')
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
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

    // TODO: Implement password reset logic
    logger.info('Password reset attempted', { email })
  },

  async register(email: string, password: string, firstName: string, lastName: string) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      throw new EmailExistsError('Email already registered')
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash: await hashPassword(password),
        firstName,
        lastName,
        role: 'PATIENT' as (typeof userRoleEnum.enumValues)[number],
      })
      .returning()

    const token = generateToken(user.id, user.email, user.role)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  },

  async resetPassword(token: string, newPassword: string) {
    // TODO: Implement password reset with token validation
    logger.info('Password reset attempted', { token })
  },
}
