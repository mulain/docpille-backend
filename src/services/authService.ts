import { AppDataSource } from '../data-source'
import { Patient } from '../entities/Patient'
import { UnauthorizedError, NotFoundError, UnverifiedEmailError } from '../utils/errors'
import { comparePasswords, generateToken } from '../utils/auth'
import { logger } from '../utils/logger'
import { UserRole } from '../types/user'

const patientRepository = AppDataSource.getRepository(Patient)
// const doctorRepository = AppDataSource.getRepository(Doctor)

// Helper function to transform user data for frontend
const transformUserForFrontend = (user: Patient) => {
  const {
    passwordHash,
    emailVerificationToken,
    emailVerificationExpires,
    verifiedAt,
    createdAt,
    updatedAt,
    ...userData
  } = user

  return userData
}

export const authService = {
  async login(email: string, password: string) {
    // Try to find user in both repositories
    const patient = await patientRepository.findOne({ where: { email } })
    // const doctor = null /await doctorRepository.findOne({ where: { email } })

    const user = patient // || doctor
    if (!user) {
      logger.info('Login attempt with non-existent email', { email })
      throw new UnauthorizedError('Invalid email or password')
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash)
    if (!isPasswordValid) {
      logger.info('Login attempt with invalid password', { email })
      throw new UnauthorizedError('Invalid email or password')
    }

    if (!user.isEmailVerified) {
      logger.info('Login attempt with unverified email', { email })
      throw new UnverifiedEmailError('Please verify your email before logging in')
    }

    const role = patient ? UserRole.PATIENT : UserRole.DOCTOR
    const token = generateToken(user.id, user.email, role)

    logger.info('Login successful', { email })
    return { user: transformUserForFrontend(user), token }
  },

  async getCurrentUser(userId: string | undefined) {
    // Try to find user in both repositories
    const patient = await patientRepository.findOne({ where: { id: userId } })
    //const doctor = await doctorRepository.findOne({ where: { id: userId } })

    const user = patient //|| doctor
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return transformUserForFrontend(user)
  },

  async forgotPassword(email: string) {
    // Try to find user in both repositories
    const patient = await patientRepository.findOne({ where: { email } })
    //const doctor = await doctorRepository.findOne({ where: { email } })

    if (!patient /* && !doctor */) {
      logger.info('Email not found', { email })
      // Not throwing an error to not reveal if email exists
      return
    }

    // TODO: Implement password reset token generation and email sending
    logger.info('Password reset requested', { email })
  },

  async resetPassword(token: string, newPassword: string) {
    // TODO: Implement password reset with token validation
    logger.info('Password reset attempted', { token })
  },
}
