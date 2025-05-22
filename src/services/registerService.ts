import crypto from 'crypto'
import { MoreThan } from 'typeorm'

// local imports
import { AppDataSource } from '../data-source'
import { Patient as PatientEntity } from '../entities/Patient'
import { BadRequestError } from '../utils/errors'
import { hashPassword } from '../utils/auth'
import { emailService } from './emailService'
import { Patient, CreatePatientDTO } from '../types/patient'
import { logger } from '../utils/logger'

const patientRepository = AppDataSource.getRepository(PatientEntity)

const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000 * 24) // 24 hours
  return { token, expires }
}

export const registerService = {
  async registerPatient(data: CreatePatientDTO): Promise<Patient> {
    const existingPatient = await patientRepository.findOne({ where: { email: data.email } })
    if (existingPatient) {
      logger.info('Email already registered', { email: data.email })
      throw new BadRequestError('Email already registered')
    }

    const passwordHash = await hashPassword(data.password)
    const { token, expires } = generateVerificationToken()

    const patient = patientRepository.create({
      ...data,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    })

    await patientRepository.save(patient)
    logger.info('New patient registered', { email: data.email })

    await emailService.sendVerificationEmail(patient.email, token, patient.firstName)

    // Remove sensitive data from response
    const {
      passwordHash: _,
      emailVerificationToken: __,
      emailVerificationExpires: ___,
      ...patientResponse
    } = patient

    return patientResponse
  },

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const patient = await patientRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: MoreThan(new Date()),
        isEmailVerified: false,
      },
    })

    if (!patient) {
      logger.info('Invalid or expired verification token', { token })
      throw new BadRequestError('Invalid or expired verification token')
    }

    // Update verification status
    patient.isEmailVerified = true
    patient.verifiedAt = new Date()
    patient.emailVerificationToken = null
    patient.emailVerificationExpires = null

    await patientRepository.save(patient)
    logger.info('Email verified', { email: patient.email }, { patientId: patient.id })
    return { success: true, message: 'Email verified successfully' }
  },

  async resendVerificationToken(email: string): Promise<void> {
    const patient = await patientRepository.findOne({ where: { email } })

    if (!patient) {
      logger.info('Patient not found, skipping resend', { email })
      return
    }

    if (patient.isEmailVerified) {
      logger.info('Email already verified, skipping resend', { email })
      return
    }

    const { token, expires } = generateVerificationToken()

    patient.emailVerificationToken = token
    patient.emailVerificationExpires = expires

    await patientRepository.save(patient)
    await emailService.sendVerificationEmail(patient.email, token, patient.firstName)
  },
}
