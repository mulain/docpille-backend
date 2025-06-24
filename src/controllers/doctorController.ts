import { Request, Response } from 'express'

// local imports
import { doctorService } from '../services/doctorService'

export const doctorController = {
  async getAllDoctors(req: Request, res: Response) {
    const doctors = await doctorService.getAllDoctors()
    res.status(200).json({ doctors })
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
