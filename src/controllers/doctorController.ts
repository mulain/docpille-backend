import { Request, Response } from 'express'
import { uuidSchema } from '@m-oss/types'

// local imports
import { doctorService } from '../services/doctorService'

export const doctorController = {
  async getAllDoctors(req: Request, res: Response) {
    const doctors = await doctorService.getAllDoctors()
    res.status(200).json({ doctors })
  },

  async getDoctorByDoctorId(req: Request, res: Response) {
    const id = uuidSchema.parse(req.params.id)
    const doctor = await doctorService.getDoctorByDoctorId(id)
    res.status(200).json({ doctor })
  },

  async getActiveDoctors(req: Request, res: Response) {
    const doctors = await doctorService.getActiveDoctors()
    res.status(200).json({ doctors })
  },

  async getCurrentDoctor(req: Request, res: Response) {
    const doctor = await doctorService.getDoctorByUserId(req.user!.id)
    res.status(200).json({ doctor })
  },
}
