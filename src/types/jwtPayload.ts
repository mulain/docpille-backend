import { userRoleEnum } from '../db/schema'

export interface JwtPayload {
  id: string
  email: string
  role: (typeof userRoleEnum.enumValues)[number]
}
