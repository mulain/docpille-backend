import { AppDataSource } from '../data-source'
import { Patient } from '../entities/Patient'
import { compare } from 'bcrypt'
import { sign, SignOptions } from 'jsonwebtoken'
import config from '../config/config'
import { JwtPayload, UserRole } from '../types/auth'
import { BadRequestError } from '../utils/errors'

export const authService = {
  async login(email: string, password: string) {
    const patientRepository = AppDataSource.getRepository(Patient)
    const patient = await patientRepository.findOne({ where: { email } })

    if (!patient) {
      throw new BadRequestError('Invalid email or password')
    }

    const isPasswordValid = await compare(password, patient.passwordHash)
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid email or password')
    }

    if (!patient.isEmailVerified) {
      throw new BadRequestError('Please verify your email before logging in')
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
}
