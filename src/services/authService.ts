import { AppDataSource } from '../data-source'
import { Patient } from '../entities/Patient'
import { UnauthorizedError, NotFoundError } from '../utils/errors'
import { comparePasswords, generateToken } from '../utils/auth'
import { logger } from '../utils/logger'
import { UserRole } from '../types/user'

const patientRepository = AppDataSource.getRepository(Patient)
// const doctorRepository = AppDataSource.getRepository(Doctor)

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

    const role = patient ? UserRole.PATIENT : UserRole.DOCTOR
    const token = generateToken(user.id, user.email, role)

    // Remove sensitive data from response
    const { passwordHash, ...userData } = user

    logger.info('Login successful', { email })
    return { user: userData, token }
  },

  async getCurrentUser(userId: string | undefined) {
    // Try to find user in both repositories
    const patient = await patientRepository.findOne({ where: { id: userId } })
    //const doctor = await doctorRepository.findOne({ where: { id: userId } })

    const user = patient //|| doctor
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Remove sensitive data from response
    const { passwordHash, ...userData } = user
    return userData
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
