import { Request, Response } from 'express'

// local imports
import { appointmentService } from '../services/appointmentService'
import {
  availableAppointmentsQuerySchema,
  createAppointmentSlotsSchema,
} from '../utils/validations'

export const appointmentController = {
  async available(req: Request, res: Response) {
    const { doctorId, after, before } = availableAppointmentsQuerySchema.parse(req.query)
    const slots = await appointmentService.available(doctorId, after, before)
    res.json({ slots })
  },

  async listSlots(req: Request, res: Response) {
    const { after, before } = availableAppointmentsQuerySchema
      .omit({ doctorId: true })
      .parse(req.query)
    const slots = await appointmentService.listSlots(req.user!.id, after, before)
    res.json({ slots })
  },

  async createSlots(req: Request, res: Response) {
    const data = createAppointmentSlotsSchema.parse(req.body)
    const slots = await appointmentService.createSlots(req.user!.id, data)
    res.status(201).json({ slots })
  },
}
