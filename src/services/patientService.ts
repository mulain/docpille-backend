import { AppDataSource } from '../data-source'
import { Patient as PatientEntity } from '../entities/Patient'
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { UserRole } from '../types/user'
import { Patient, UpdatePatientDTO } from '../types/patient'
import { logger } from '../utils/logger'

interface RequestUser {
  role: UserRole
  entityId?: string
}

const patientRepository = AppDataSource.getRepository(PatientEntity)

export const patientService = {
  // Get all patients - Only accessible by medical staff
  async getAllPatients(user: { role: UserRole }): Promise<Patient[]> {
    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedError('Only medical staff can view all patients')
    }

    const patients = await patientRepository.find()
    return patients.map(patient => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      isEmailVerified: patient.isEmailVerified,
      verifiedAt: patient.verifiedAt,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }))
  },

  // Get patient by ID - Only accessible by the patient themselves or medical staff
  async getPatientById(id: string, user: { role: UserRole; id?: string }): Promise<Patient> {
    const patient = await patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.ADMIN && user.id !== patient.id) {
      throw new UnauthorizedError('You can only view your own patient information')
    }

    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      isEmailVerified: patient.isEmailVerified,
      verifiedAt: patient.verifiedAt,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }
  },

  // Update patient - Patients can update their own basic info, medical staff can update everything
  async updatePatient(
    id: string,
    data: UpdatePatientDTO,
    user: { role: UserRole; id?: string }
  ): Promise<Patient> {
    const patient = await patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.ADMIN && user.id !== patient.id) {
      throw new UnauthorizedError('You can only update your own patient information')
    }

    // Update patient data
    Object.assign(patient, data)
    const updatedPatient = await patientRepository.save(patient)

    return {
      id: updatedPatient.id,
      firstName: updatedPatient.firstName,
      lastName: updatedPatient.lastName,
      dateOfBirth: updatedPatient.dateOfBirth,
      email: updatedPatient.email,
      phoneNumber: updatedPatient.phoneNumber,
      address: updatedPatient.address,
      isEmailVerified: updatedPatient.isEmailVerified,
      verifiedAt: updatedPatient.verifiedAt,
      createdAt: updatedPatient.createdAt,
      updatedAt: updatedPatient.updatedAt,
    }
  },

  // Delete patient - Only accessible by medical staff
  async deletePatient(id: string, user: { role: UserRole }): Promise<void> {
    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedError('Only medical staff can delete patients')
    }

    const patient = await patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    await patientRepository.remove(patient)
  },

  // Get patient's appointments - Only accessible by the patient themselves or medical staff
  async getPatientAppointments(id: string, user: { role: UserRole; id?: string }): Promise<any[]> {
    const patient = await patientRepository.findOne({ where: { id } })
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.ADMIN && user.id !== patient.id) {
      throw new UnauthorizedError('You can only view your own appointments')
    }

    // TODO: Implement database integration to fetch patient's appointments
    return []
  },

  // Helper method to verify access rights
  verifyAccess(patientId: string, user: RequestUser): void {
    // Admins and doctors can access any patient
    if (user.role === UserRole.ADMIN || user.role === UserRole.DOCTOR) {
      return
    }

    // Patients can only access their own data
    if (user.role === UserRole.PATIENT && user.entityId !== patientId) {
      throw new UnauthorizedError('You can only access your own data')
    }
  },
}
