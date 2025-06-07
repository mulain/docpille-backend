import { Request, Response } from 'express'
import { addDays } from 'date-fns'

// local imports
import { appointmentService } from '../services/appointmentService'
import {
  availableAppointmentsQuerySchema,
  availableSlotsPathSchema,
  createAppointmentSlotsSchema,
} from '../utils/validations'

export const appointmentController = {
  async availableSlots(req: Request, res: Response) {
    const { doctorId, startDate } = availableSlotsPathSchema.parse(req.params)

    // Convert startDate to UTC midnight
    const start = new Date(`${startDate}T00:00:00Z`)
    // Default to 7 days from start date
    const end = addDays(start, 7)

    const slots = await appointmentService.available(doctorId, start, end)
    res.json({ slots })
  },

  async listSlots(req: Request, res: Response) {
    const { after, before } = availableAppointmentsQuerySchema
      .omit({ doctorId: true })
      .parse(req.query)
    const slots = await appointmentService.getMySlots(req.user!.id, after, before)
    res.json({ slots })
  },

  async createSlots(req: Request, res: Response) {
    const data = createAppointmentSlotsSchema.parse(req.body)
    const slots = await appointmentService.createSlots(req.user!.id, data)
    res.status(201).json({ slots })
  },

  async deleteSlot(req: Request, res: Response) {
    const { id } = req.params
    await appointmentService.deleteSlot(req.user!.id, id)
    res.status(204).send()
  },
}
