import { Request, Response } from 'express'
import {
  cleanedUpdateIdentitySchema,
  cleanedUpdateContactSchema,
  cleanedUpdateDoctorSchema,
} from '@m-oss/types'

// local imports
import { userService } from '../services/userService'
import { doctorService } from '../services/doctorService'

export const userController = {
  async getCurrentUser(req: Request, res: Response) {
    const user = await userService.getCurrentUser(req.user!.id)
    res.json({ user })
  },

  async updateIdentityFields(req: Request, res: Response) {
    const data = cleanedUpdateIdentitySchema.parse(req.body)
    const user = await userService.updateIdentityFields(req.user!.id, data)
    res.json({ user })
  },

  async updateContactFields(req: Request, res: Response) {
    const data = cleanedUpdateContactSchema.parse(req.body)
    const user = await userService.updateContactFields(req.user!.id, data)
    res.json({ user })
  },

  async updateDoctorFields(req: Request, res: Response) {
    const data = cleanedUpdateDoctorSchema.parse(req.body)
    const doctor = await doctorService.updateDoctorFields(req.user!.id, data)
    res.json({ doctor })
  },

  // TODO: Implement delete user
  async deleteMe(req: Request, res: Response) {
    res.status(501).json({ message: 'Not implemented' })
    //await userService.deleteMe(req.user!.id)
    //res.json({ message: 'User deleted' })
  },
}
