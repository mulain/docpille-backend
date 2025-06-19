import { Request, Response } from 'express'
import { uuidSchema, createDoctorSchema, updateProfileDoctorSchema } from '@m-oss/types'

// local imports
import { adminService } from '../services/adminService'

export const adminController = {
  async createDoctor(req: Request, res: Response) {
    const data = createDoctorSchema.parse(req.body)
    const doctor = await adminService.createDoctor(data)
    res.status(200).json({ doctor })
  },

  async inactivateDoctor(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    const doctor = await adminService.inactivateDoctor(id)
    res.status(200).json({ doctor })
  },

  async activateDoctor(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    const doctor = await adminService.activateDoctor(id)
    res.status(200).json({ doctor })
  },

  async editDoctor(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    const data = updateProfileDoctorSchema.parse(req.body)
    const doctor = await adminService.editDoctor(id, data)
    res.status(200).json({ doctor })
  },
}
