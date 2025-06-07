export type AppointmentStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED'

export interface AppointmentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
}

export interface AppointmentSlot {
  appointmentId: string
  doctorId: string
  startTime: Date
  endTime: Date
  bookedAt: Date | null
  reservedUntil: Date | null
  reason: string | null
  patientNotes: string | null
  doctorNotes: string | null
  videoCall: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  status: AppointmentStatus
  patient: AppointmentUser | null
}
