import { Request, Response } from 'express'
import {
  timeRangeSchema,
  doctorTimeRangeSchema,
  createSlotsSchema,
  uuidSchema,
  editSlotDoctorSchema,
  editSlotPatientSchema,
  editSlotAdminSchema,
} from '@m-oss/types'

// local imports
import { appointmentService } from '../services/appointmentService'
import { ForbiddenError } from '../utils/errors'

export const appointmentController = {
  async getAvailableSlotsByDoctorId(req: Request, res: Response) {
    const { doctorId, after, before } = doctorTimeRangeSchema.parse(req.query)
    const slots = await appointmentService.availableSlotsByDoctorId(doctorId, after, before)
    res.json({ slots })
  },

  async getMySlots(req: Request, res: Response) {
    const { after, before } = timeRangeSchema.parse(req.query)
    if (req.user?.role === 'DOCTOR') {
      const slots = await appointmentService.getMySlotsDoctor(req.user!.id, after, before)
      res.json({ slots })
    } else {
      const slots = await appointmentService.getMySlotsPatient(req.user!.id, after, before)
      res.json({ slots })
    }
  },

  async createSlots(req: Request, res: Response) {
    const data = createSlotsSchema.parse(req.body)
    const slots = await appointmentService.createSlots(req.user!.id, data)
    res.status(201).json({ slots })
  },

  async bookSlot(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    await appointmentService.bookSlot(req.user!.id, id)
    res.status(204).send()
  },

  async cancelSlot(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    await appointmentService.cancelSlot(req.user!.id, id)
    res.status(204).send()
  },

  async deleteSlot(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    await appointmentService.deleteSlot(req.user!.id, id)
    res.status(204).send()
  },

  async updateSlot(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)

    switch (req.user?.role) {
      case 'DOCTOR': {
        const data = editSlotDoctorSchema.parse(req.body)
        const updatedSlot = await appointmentService.updateSlotDoctor(req.user.id, id, data)
        return res.json({ slot: updatedSlot })
      }
      case 'PATIENT': {
        const data = editSlotPatientSchema.parse(req.body)
        const updatedSlot = await appointmentService.updateSlotPatient(req.user.id, id, data)
        return res.json({ slot: updatedSlot })
      }
      case 'ADMIN': {
        const data = editSlotAdminSchema.parse(req.body)
        const updatedSlot = await appointmentService.updateSlotAdmin(req.user.id, id, data)
        return res.json({ slot: updatedSlot })
      }
      default:
        throw new ForbiddenError('You are not authorized to update this slot')
    }
  },
}
