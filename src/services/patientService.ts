import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/errors'
import { UserRole } from '../types/auth'
import { hashPassword } from '../utils/auth'
import crypto from 'crypto'
import { EmailService } from './emailService'
import { Patient as PatientEntity } from '../entities/Patient'
import { AppDataSource } from '../data-source'
import { MoreThan } from 'typeorm'
import { Patient, CreatePatientDTO, UpdatePatientDTO, patientSchema } from '../types/patient'

interface RequestUser {
  role: UserRole
  entityId?: string
}

export class PatientService {
  private patientRepository = AppDataSource.getRepository(PatientEntity)

  // New users can register as patients
  async registerPatient(data: CreatePatientDTO): Promise<Patient> {
    const existingPatient = await this.patientRepository.findOne({ where: { email: data.email } })
    if (existingPatient) {
      throw new BadRequestError('Email already registered')
    }

    const passwordHash = await hashPassword(data.password)

    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    const patient = this.patientRepository.create({
      ...data,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    })

    await this.patientRepository.save(patient)

    await EmailService.sendVerificationEmail(
      patient.email,
      emailVerificationToken,
      patient.firstName
    )

    // Remove sensitive data from response
    const {
      passwordHash: _,
      emailVerificationToken: __,
      emailVerificationExpires: ___,
      ...patientResponse
    } = patient

    return patientResponse
  }

  async verifyEmail(token: string): Promise<void> {
    const patient = await this.patientRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: MoreThan(new Date()),
        isEmailVerified: false,
      },
    })

    if (!patient) {
      throw new BadRequestError('Invalid or expired verification token')
    }

    // Update verification status
    patient.isEmailVerified = true
    patient.verifiedAt = new Date()
    patient.emailVerificationToken = null
    patient.emailVerificationExpires = null

    await this.patientRepository.save(patient)
  }

  // Get all patients - Only accessible by medical staff
  async getAllPatients(user: RequestUser): Promise<Patient[]> {
    if (user.role === UserRole.PATIENT) {
      throw new UnauthorizedError('Unauthorized to view all patients')
    }

    const patients = await this.patientRepository.find()
    return patients.map(
      ({ passwordHash, emailVerificationToken, emailVerificationExpires, ...patient }) => patient
    )
  }

  // Get patient by ID - Only accessible by the patient themselves or medical staff
  async getPatientById(id: string, user: RequestUser): Promise<Patient> {
    // Verify access rights
    this.verifyAccess(id, user)

    const patient = await this.patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    const { passwordHash, emailVerificationToken, emailVerificationExpires, ...patientResponse } =
      patient
    return patientResponse
  }

  // Update patient - Patients can update their own basic info, medical staff can update everything
  async updatePatient(id: string, data: UpdatePatientDTO, user: RequestUser): Promise<Patient> {
    // First verify the patient exists
    const patient = await this.patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    // Verify access rights
    this.verifyAccess(id, user)

    // If the user is a patient (not medical staff), restrict what fields they can update
    if (user.role === UserRole.PATIENT) {
      const allowedFields: (keyof Patient)[] = ['phoneNumber', 'address']

      // Check if trying to update restricted fields
      const attemptedFields = Object.keys(data)
      const restrictedUpdate = attemptedFields.some(
        field => !allowedFields.includes(field as keyof Patient)
      )

      if (restrictedUpdate) {
        throw new UnauthorizedError(
          'Patients can only update their contact information and emergency contact'
        )
      }
    }

    // Update patient
    Object.assign(patient, data)
    const updatedPatient = await this.patientRepository.save(patient)

    const { passwordHash, emailVerificationToken, emailVerificationExpires, ...patientResponse } =
      updatedPatient
    return patientResponse
  }

  // Delete patient - Only accessible by admin
  async deletePatient(id: string, user: RequestUser): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedError('Only administrators can delete patients')
    }

    const patient = await this.patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    await this.patientRepository.remove(patient)
  }

  // Get patient's appointments - Only accessible by the patient themselves or medical staff
  async getPatientAppointments(id: string, user: RequestUser): Promise<any[]> {
    // Verify access rights
    this.verifyAccess(id, user)

    // TODO: Implement database integration to fetch patient's appointments
    return []
  }

  // Helper method to verify access rights
  private verifyAccess(patientId: string, user: RequestUser): void {
    // Admins and doctors can access any patient
    if (user.role === UserRole.ADMIN || user.role === UserRole.DOCTOR) {
      return
    }

    // Patients can only access their own data
    if (user.role === UserRole.PATIENT && user.entityId !== patientId) {
      throw new UnauthorizedError('You can only access your own data')
    }
  }
}
