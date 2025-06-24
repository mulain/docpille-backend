import { Request, Response } from 'express'
import { updateProfileDoctorSchema, updateProfilePatientSchema } from '@m-oss/types'

// local imports
import { userService } from '../services/userService'
import { BadRequestError } from '../utils/errors'

export const userController = {
  async getCurrentUser(req: Request, res: Response) {
    const user = await userService.getCurrentUser(req.user!.id)
    res.json({ user })
  },

  async updateProfile(req: Request, res: Response) {
    if (req.user!.role === 'PATIENT') {
      const data = updateProfilePatientSchema.parse(req.body)
      const user = await userService.updateProfilePatient(req.user!.id, data)
      
      return res.json({ user })
    } 
    
    if (req.user!.role === 'DOCTOR') {
      const data = updateProfileDoctorSchema.parse(req.body)
      const user = await userService.updateProfileDoctor(req.user!.id, data)
      
      return res.json({ user })
    }

    throw new BadRequestError('Invalid user role, Admin not implemented yet')
  },

  // TODO: Implement delete user
  async deleteMe(req: Request, res: Response) {
    res.status(501).json({ message: 'Not implemented' })
    //await userService.deleteMe(req.user!.id)
    //res.json({ message: 'User deleted' })
  },
}
