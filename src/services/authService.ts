import { AppDataSource } from '../data-source'
import { compare, hash } from 'bcrypt'
import { sign, SignOptions, verify } from 'jsonwebtoken'

// local imports
import { Patient } from '../entities/Patient'
import config from '../config/config'
import { JwtPayload, UserRole } from '../types/auth'
import { BadRequestError } from '../utils/errors'
import { emailService } from './emailService'
import { logger } from '../utils/logger'

const patientRepository = AppDataSource.getRepository(Patient)

export const authService = {
  async login(email: string, password: string) {
    const patient = await patientRepository.findOne({ where: { email } })

    if (!patient) {
      logger.info('Invalid email on login attempt', { email })
      throw new BadRequestError('Invalid email or password')
    }

    const isPasswordValid = await compare(password, patient.passwordHash)
    if (!isPasswordValid) {
      logger.info('Invalid password on login attempt', { email })
      throw new BadRequestError('Invalid email or password')
    }

    const payload: JwtPayload = {
      id: patient.id,
      email: patient.email,
      role: UserRole.PATIENT,
    }

    const options: SignOptions = {
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    }

    const token = sign(payload, config.jwt.secret, options)
    logger.info('Login successful', { email })

    return {
      token,
      user: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
    }
  },

  async forgotPassword(email: string) {
    const patient = await patientRepository.findOne({ where: { email } })

    if (!patient) {
      logger.info('Email not found', { email })
      // Don't reveal that the email doesn't exist
      return
    }

    const payload = {
      id: patient.id,
      email: patient.email,
      type: 'password-reset',
    }

    const options: SignOptions = {
      expiresIn: '1h', // Token expires in 1 hour
    }

    const token = sign(payload, config.jwt.secret, options)
    await emailService.sendPasswordResetEmail(patient.email, token, patient.firstName)
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = verify(token, config.jwt.secret) as JwtPayload & { type: string }

      if (decoded.type !== 'password-reset') {
        throw new BadRequestError('Invalid token')
      }

      const patient = await patientRepository.findOne({ where: { id: decoded.id } })

      if (!patient) {
        throw new BadRequestError('User not found')
      }

      const passwordHash = await hash(newPassword, 10)
      patient.passwordHash = passwordHash
      await patientRepository.save(patient)
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error
      }
      throw new BadRequestError('Invalid or expired token')
    }
  },
}
