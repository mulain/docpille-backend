import { Request, Response } from 'express'

// local imports
import { appointmentService } from '../services/appointmentService'
import { availableAppointmentsQuerySchema } from '../utils/validations'

export const appointmentController = {
  async available(req: Request, res: Response) {
    const { doctorId, after, before } = availableAppointmentsQuerySchema.parse(req.query)
    const slots = await appointmentService.available(doctorId, after, before)
    res.json({ slots })
  },
}
