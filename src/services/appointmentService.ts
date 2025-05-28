import { and, eq, isNull, gte, lte } from 'drizzle-orm'

// local imports
import { db } from '../db'
import { appointments } from '../db/schema'
import { BadRequestError } from '../utils/errors'

export const appointmentService = {
  async available(doctorId: string, after: Date, before: Date) {
    const now = new Date()
    const maxBefore = new Date()
    maxBefore.setFullYear(now.getFullYear() + 1)

    if (after < now) {
      throw new BadRequestError('"after" must not be in the past')
    }
    if (before > maxBefore) {
      throw new BadRequestError('"before" must be within 1 year from now')
    }

    // Find available slots
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
}
