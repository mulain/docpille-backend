import { Request, Response } from 'express'
import { updateProfileSchema } from '@m-oss/types'

// local imports
import { userService } from '../services/userService'

export const userController = {
  async getCurrentUser(req: Request, res: Response) {
    const user = await userService.getCurrentUser(req.user!.id)
    res.json({ user })
  },

  async updateProfile(req: Request, res: Response) {
    const data = updateProfileSchema.parse(req.body)
    const user = await userService.updateProfile(req.user!.id, data)
    res.json({ user })
  },

  // TODO: Implement delete user
  async deleteMe(req: Request, res: Response) {
    res.status(501).json({ message: 'Not implemented' })
    //await userService.deleteMe(req.user!.id)
    //res.json({ message: 'User deleted' })
  },
}
