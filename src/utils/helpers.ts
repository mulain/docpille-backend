import { SelectDoctor, SelectUser } from '../types/user'

// TODO: remove this function when types are updated
export function stripUndefined<T extends Record<string, any>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

export function prepareUserResponse(user: SelectUser) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    phoneNumber: user.phoneNumber,
    address: user.address,
    role: user.role,
  }
}
export function prepareDoctorResponse(doctor: SelectDoctor) {
  return {
    id: doctor.id,
    specialization: doctor.specialization,
    active: doctor.active,
  }
}
