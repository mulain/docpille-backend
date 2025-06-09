import { Request, Response } from 'express'

// local imports
import { appointmentService } from '../services/appointmentService'
import { availableSlotsQuerySchema, createAppointmentSlotsSchema } from '../utils/validations'

export const appointmentController = {
  async getAvailableSlotsByDoctorId(req: Request, res: Response) {
    const { doctorId, after, before } = availableSlotsQuerySchema.parse(req.query)
    const slots = await appointmentService.availableSlotsByDoctorId(doctorId, after, before)
    res.json({ slots })
  },

  async getMySlotsDoctor(req: Request, res: Response) {
    const { after, before } = availableSlotsQuerySchema.omit({ doctorId: true }).parse(req.query)
    const slots = await appointmentService.getMySlotsDoctor(req.user!.id, after, before)
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
