import { and, eq, isNull, gte, lte, lt, gt, or, sql } from 'drizzle-orm'
import {
  CreateSlotsDTO,
  DoctorSlot,
  EditSlotDoctorDTO,
  EditSlotPatientDTO,
  EditSlotAdminDTO,
  BasicSlot,
} from '@m-oss/types'

// local imports
import { db } from '../db'
import { appointments, doctors, users, patients } from '../db/schema'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  AlreadyHasAppointmentError,
} from '../utils/errors'
import { doctorService } from './doctorService'
import { patientService } from './patientService'
import { stripUndefined } from '../utils/helpers'
import { adminService } from './adminService'

// Helper functions
async function validateSlots(
  doctorId: string,
  slots: { startTime: Date; endTime: Date }[],
  now: number = Date.now()
) {
  // Validate individual slots
  for (const { startTime, endTime } of slots) {
    if (startTime.getTime() < now) {
      throw new BadRequestError('Slot start time must be in the future')
    }
    if (endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestError('End time must be after start time')
    }

    // Order slots to allow efficient loop and check for overlaps within the new slots
    const sortedSlots = [...slots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    for (let i = 1; i < sortedSlots.length; i++) {
      if (sortedSlots[i].startTime < sortedSlots[i - 1].endTime) {
        throw new BadRequestError('Appointment slots must not overlap')
      }
    }

    // Check for overlaps with existing slots
    const overlapConditions = slots.map(slot =>
      and(lt(appointments.startTime, slot.endTime), gt(appointments.endTime, slot.startTime))
    )

    const existingOverlap = await db.query.appointments.findFirst({
      where: and(eq(appointments.doctorId, doctorId), or(...overlapConditions)),
    })

    if (existingOverlap) {
      throw new BadRequestError('One or more new slots overlap with existing slots')
    }
  }
}

function normalizeDates<T extends Record<string, any>>(
  obj: T
): {
  [K in keyof T]: T[K] extends Date ? string : T[K]
} {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ])
  ) as any
}

function baseSlotFields() {
  return {
    id: appointments.id,
    startTime: appointments.startTime,
    endTime: appointments.endTime,
    bookedAt: appointments.bookedAt,
    reservedUntil: appointments.reservedUntil,
    reason: appointments.reason,
    patientNotes: appointments.patientNotes,
    videoCall: appointments.videoCall,
    status: sql`
      CASE
        WHEN ${appointments.endTime} < NOW() AND ${appointments.bookedAt} IS NOT NULL THEN 'COMPLETED'
        WHEN ${appointments.bookedAt} IS NOT NULL THEN 'BOOKED'
        WHEN ${appointments.reservedUntil} IS NOT NULL THEN 'RESERVED'
        WHEN ${appointments.startTime} < NOW() AND ${appointments.bookedAt} IS NULL THEN 'EXPIRED'
        ELSE 'AVAILABLE'
      END
    `.as('status'),
  }
}

export const appointmentService = {
  async availableSlotsByDoctorId(
    doctorId: string,
    after: Date,
    before: Date
  ): Promise<BasicSlot[]> {
    const now = new Date()
    const maxBefore = new Date()
    maxBefore.setUTCFullYear(now.getUTCFullYear() + 1)

    if (after < now) {
      after = now
    }

    if (before > maxBefore) {
      throw new BadRequestError('Max query range is 1 year from current date')
    }

    const slots = await db.query.appointments.findMany({
      where: and(
        eq(appointments.doctorId, doctorId),
        isNull(appointments.patientId),
        gte(appointments.startTime, after),
        lte(appointments.endTime, before)
      ),
      columns: {
        id: true,
        startTime: true,
        endTime: true,
      },
    })

    return slots.map(slot => normalizeDates(slot))
  },

  async createSlots(userId: string, data: CreateSlotsDTO) {
    const doctor = await doctorService.assertIsDoctor(userId)
    const now = Date.now()

    const slots = data.slots.map(({ startTime: startStr, endTime: endStr }) => {
      const startTime = new Date(startStr)
      const endTime = new Date(endStr)

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new BadRequestError('Invalid date format in slot')
      }

      return { startTime, endTime }
    })

    await validateSlots(doctor.id, slots, now)

    const slotsToInsert = slots.map(slot => ({
      doctorId: doctor.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }))

    const createdSlots = await db.transaction(async tx => {
      const created = await tx.insert(appointments).values(slotsToInsert).returning()
      return created
    })

    return createdSlots
  },

  async getMySlotsDoctor(userId: string, after: Date, before: Date): Promise<DoctorSlot[]> {
    const doctor = await doctorService.assertIsDoctor(userId)

    const dbSlots = await db
      .select({
        ...baseSlotFields(),
        doctorNotes: appointments.doctorNotes,
        patient: {
          id: patients.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          address: users.address,
          dateOfBirth: users.dateOfBirth,
          gender: users.gender,
          age: sql<number | null>`
            CASE WHEN ${users.dateOfBirth} IS NOT NULL
              THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${users.dateOfBirth}::timestamp))::int
            ELSE NULL END
        `.as('age'),
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .where(
        and(
          eq(appointments.doctorId, doctor.id),
          gte(appointments.startTime, after),
          lte(appointments.endTime, before)
        )
      )

    return dbSlots.map(({ patient, ...slot }) => ({
      ...normalizeDates(slot),
      patient: patient?.id ? patient : null,
    })) as DoctorSlot[]
  },

  async getMySlotsPatient(userId: string, after: Date, before: Date): Promise<BasicSlot[]> {
    const patient = await patientService.assertIsPatient(userId)

    const dbSlots = await db
      .select({
        ...baseSlotFields(),
        doctor: {
          id: doctors.id,
          firstName: users.firstName,
          lastName: users.lastName,
          specialization: doctors.specialization,
        },
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(appointments.patientId, patient.id),
          gte(appointments.startTime, after),
          lte(appointments.endTime, before)
        )
      )

    return dbSlots.map(slot => ({
      ...normalizeDates(slot),
      id: slot.id,
    })) as BasicSlot[]
  },

  async bookSlot(userId: string, slotId: string) {
    const patient = await patientService.assertIsPatient(userId)

    const slot = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, slotId), isNull(appointments.patientId)),
    })

    if (!slot) {
      throw new NotFoundError('Slot not found')
    }

    await doctorService.assertIsDoctorActive(slot.doctorId)

    const existingFutureAppointment = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.doctorId, slot.doctorId),
        eq(appointments.patientId, patient.id),
        gte(appointments.startTime, new Date())
      ),
    })

    if (existingFutureAppointment) {
      throw new AlreadyHasAppointmentError()
    }

    const [updatedSlot] = await db
      .update(appointments)
      .set({ patientId: patient.id, bookedAt: new Date() })
      .where(eq(appointments.id, slotId))
      .returning()

    return normalizeDates(updatedSlot)
  },

  async bookSlotWithDetails(userId: string, slotId: string, data: EditSlotPatientDTO) {
    const patient = await patientService.assertIsPatient(userId)

    const slot = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, slotId), isNull(appointments.patientId)),
    })

    if (!slot) {
      throw new NotFoundError('Slot not found')
    }

    await doctorService.assertIsDoctorActive(slot.doctorId)

    const existingFutureAppointment = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.doctorId, slot.doctorId),
        eq(appointments.patientId, patient.id),
        gte(appointments.startTime, new Date())
      ),
    })

    if (existingFutureAppointment) {
      throw new AlreadyHasAppointmentError()
    }

    const [updatedSlot] = await db
      .update(appointments)
      .set({
        patientId: patient.id,
        bookedAt: new Date(),
        ...data,
      })
      .where(eq(appointments.id, slotId))
      .returning()

    return normalizeDates(updatedSlot)
  },

  async cancelSlot(userId: string, slotId: string) {
    const patient = await patientService.assertIsPatient(userId)

    const slot = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, slotId), eq(appointments.patientId, patient.id)),
    })

    if (!slot) {
      throw new NotFoundError('Slot not found')
    }

    const [updatedSlot] = await db
      .update(appointments)
      .set({ patientId: null, bookedAt: null })
      .where(eq(appointments.id, slotId))
      .returning()

    return normalizeDates(updatedSlot)
  },

  async deleteSlot(userId: string, slotId: string) {
    const doctor = await doctorService.assertIsDoctor(userId)

    const slot = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, slotId), eq(appointments.doctorId, doctor.id)),
    })

    if (!slot) {
      throw new ForbiddenError('Slot not found or you do not have permission to delete it')
    }

    if (slot.patientId) {
      throw new BadRequestError('Cannot delete a slot that is booked or reserved')
    }

    await db.delete(appointments).where(eq(appointments.id, slotId))
  },

  async updateSlotDoctor(userId: string, slotId: string, rawData: EditSlotDoctorDTO) {
    const doctor = await doctorService.assertIsDoctor(userId)

    const data = stripUndefined(rawData)

    const slot = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, slotId), eq(appointments.doctorId, doctor.id)),
    })

    if (!slot) {
      throw new ForbiddenError('This appointment either does not exist or does not belong to you')
    }

    if ('startTime' in data || 'endTime' in data) {
      if (slot.patientId) {
        throw new BadRequestError('Cannot update times of a slot that is booked or reserved')
      }
      const newStartTime = data.startTime || slot.startTime
      const newEndTime = data.endTime || slot.endTime

      await validateSlots(doctor.id, [{ startTime: newStartTime, endTime: newEndTime }])
    }

    const [updatedSlot] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, slotId))
      .returning()

    return normalizeDates(updatedSlot)
  },

  async updateSlotPatient(userId: string, slotId: string, rawData: EditSlotPatientDTO) {
    const patient = await patientService.assertIsPatient(userId)

    const data = stripUndefined(rawData)

    const slot = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, slotId), eq(appointments.patientId, patient.id)),
    })

    if (!slot) {
      throw new ForbiddenError('This appointment either does not exist or does not belong to you')
    }

    const [updatedSlot] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, slotId))
      .returning()

    return normalizeDates(updatedSlot)
  },

  async updateSlotAdmin(userId: string, slotId: string, rawData: EditSlotAdminDTO) {
    await adminService.assertIsAdmin(userId)

    const data = stripUndefined(rawData)

    const slot = await db.query.appointments.findFirst({
      where: eq(appointments.id, slotId),
    })

    if (!slot) {
      throw new NotFoundError('Appointment not found')
    }

    const [updatedSlot] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, slotId))
      .returning()

    return normalizeDates(updatedSlot)
  },
}
