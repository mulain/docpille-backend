import { and, eq, isNull, gte, lte, lt, gt, or, sql } from 'drizzle-orm'
import { CreateSlotsDTO, DoctorSlot, PatientSlot } from '@m-oss/types'

// local imports
import { db } from '../db'
import { appointments, doctors, users, patients } from '../db/schema'
import { BadRequestError, ForbiddenError } from '../utils/errors'
import { doctorService } from './doctorService'
import { patientService } from './patientService'

export const appointmentService = {
  async availableSlotsByDoctorId(doctorId: string, after: Date, before: Date) {
    const now = new Date()
    const maxBefore = new Date()
    maxBefore.setUTCFullYear(now.getUTCFullYear() + 1)

    if (after < now) {
      after = now
    }

    if (before > maxBefore) {
      throw new BadRequestError('Max query range is 1 year from current date')
    }

    return db.query.appointments.findMany({
      where: and(
        eq(appointments.doctorId, doctorId),
        isNull(appointments.patientId),
        gte(appointments.startTime, after),
        lte(appointments.endTime, before)
      ),
      columns: {
        id: true,
        doctorId: true,
        startTime: true,
        endTime: true,
      },
    })
  },

  validateSlots(slots: { startTime: Date; endTime: Date }[], now: number) {
    for (const { startTime, endTime } of slots) {
      if (startTime.getTime() < now) {
        throw new BadRequestError('Slot start time must be in the future')
      }
      if (endTime.getTime() <= startTime.getTime()) {
        throw new BadRequestError('End time must be after start time')
      }

      const startDay = Date.UTC(
        startTime.getUTCFullYear(),
        startTime.getUTCMonth(),
        startTime.getUTCDate()
      )
      const endDay = Date.UTC(endTime.getUTCFullYear(), endTime.getUTCMonth(), endTime.getUTCDate())

      if (startDay !== endDay) {
        throw new BadRequestError('Appointment slots must be within the same day')
      }
    }

    const sortedSlots = [...slots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    for (let i = 1; i < sortedSlots.length; i++) {
      if (sortedSlots[i].startTime < sortedSlots[i - 1].endTime) {
        throw new BadRequestError('Appointment slots must not overlap')
      }
    }
  },

  async checkOverlapWithExisting(
    doctorId: string,
    newSlots: { startTime: Date; endTime: Date }[]
  ): Promise<void> {
    const overlapConditions = newSlots.map(slot =>
      and(lt(appointments.startTime, slot.endTime), gt(appointments.endTime, slot.startTime))
    )

    const existingOverlap = await db.query.appointments.findFirst({
      where: and(eq(appointments.doctorId, doctorId), or(...overlapConditions)),
    })

    if (existingOverlap) {
      throw new BadRequestError('One or more new slots overlap with existing slots')
    }
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

    this.validateSlots(slots, now)
    await this.checkOverlapWithExisting(doctor.id, slots)

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

  baseSlotFields() {
    return {
      appointmentId: appointments.id,
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
  },

  formatSlotTimes(slot: {
    startTime: Date
    endTime: Date
    bookedAt?: Date | null
    reservedUntil?: Date | null
  }) {
    return {
      ...slot,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      bookedAt: slot.bookedAt?.toISOString() ?? null,
      reservedUntil: slot.reservedUntil?.toISOString() ?? null,
    }
  },

  async getMySlotsDoctor(userId: string, after: Date, before: Date): Promise<DoctorSlot[]> {
    const doctor = await doctorService.assertIsDoctor(userId)

    const dbSlots = await db
      .select({
        ...this.baseSlotFields(),
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

    return dbSlots.map(slot => this.formatSlotTimes(slot)) as DoctorSlot[]
  },

  async getMySlotsPatient(userId: string, after: Date, before: Date): Promise<PatientSlot[]> {
    const patient = await patientService.assertIsPatient(userId)

    const dbSlots = await db
      .select({
        ...this.baseSlotFields(),
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

    return dbSlots.map(slot => this.formatSlotTimes(slot)) as PatientSlot[]
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
}
