import { Request, Response } from 'express'
import { timeRangeSchema, doctorTimeRangeSchema, createSlotsSchema } from '@m-oss/types'

// local imports
import { appointmentService } from '../services/appointmentService'

export const appointmentController = {
  async getAvailableSlotsByDoctorId(req: Request, res: Response) {
    const { doctorId, after, before } = doctorTimeRangeSchema.parse(req.query)
    const slots = await appointmentService.availableSlotsByDoctorId(doctorId, after, before)
    res.json({ slots })
  },

  async getMySlotsDoctor(req: Request, res: Response) {
    const { after, before } = timeRangeSchema.parse(req.query)
    const slots = await appointmentService.getMySlotsDoctor(req.user!.id, after, before)
    res.json({ slots })
  },

  async createSlots(req: Request, res: Response) {
    const data = createSlotsSchema.parse(req.body)
    const slots = await appointmentService.createSlots(req.user!.id, data)
    res.status(201).json({ slots })
  },

  async deleteSlot(req: Request, res: Response) {
    const { id } = req.params
    await appointmentService.deleteSlot(req.user!.id, id)
    res.status(204).send()
  },
}
