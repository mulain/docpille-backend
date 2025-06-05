import { and, eq, isNull, gte, lte, lt, gt, or } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { appointments, doctors } from '../db/schema'
import { BadRequestError, ForbiddenError } from '../utils/errors'
import { CreateAppointmentSlotsDTO } from '../utils/validations'

export const appointmentService = {
  async available(doctorId: string, after: Date, before: Date) {
    const now = new Date()
    const maxBefore = new Date()
    maxBefore.setUTCFullYear(now.getUTCFullYear() + 1)

    if (after < now) {
      throw new BadRequestError('"after" must not be in the past')
    }
    if (before > maxBefore) {
      throw new BadRequestError('"before" must be within 1 year from now')
    }

    return db.query.appointments.findMany({
      where: and(
        eq(appointments.doctorId, doctorId),
        isNull(appointments.patientId),
        isNull(appointments.reservedBy),
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

  async createSlots(userId: string, data: CreateAppointmentSlotsDTO) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    })

    if (!doctor) {
      throw new ForbiddenError('User is not a doctor')
    }

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

  async listSlots(userId: string, after: Date, before: Date) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    })

    if (!doctor) {
      throw new ForbiddenError('User is not a doctor')
    }

    return db.query.appointments.findMany({
      where: and(
        eq(appointments.doctorId, doctor.id),
        gte(appointments.startTime, after),
        lte(appointments.endTime, before)
      ),
      columns: {
        id: true,
        doctorId: true,
        startTime: true,
        endTime: true,
        patientId: true,
        reservedBy: true,
      },
    })
  },
}
