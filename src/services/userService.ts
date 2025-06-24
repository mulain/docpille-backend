import { eq } from 'drizzle-orm'
import { UpdateContactDTO, UpdateIdentityDTO } from '@m-oss/types'

// local imports
import { db } from '../db'
import { users } from '../db/schema'
import { prepareUserResponse } from '../utils/helpers'
import { NotFoundError } from '../utils/errors'
import { hashPassword } from '../utils/auth'

export const userService = {
  async getCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return null
    }

    return prepareUserResponse(user)
  },

  async updateIdentityFields(userId: string, data: UpdateIdentityDTO) {
    const userUpdate: Record<string, any> = { ...data }

    if (typeof data.password === 'string') {
      userUpdate.passwordHash = await hashPassword(data.password)
      delete userUpdate.password
    }

    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      throw new NotFoundError('User not found')
    }

    return prepareUserResponse(updatedUser)
  },

  async updateContactFields(userId: string, data: UpdateContactDTO) {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, userId)).returning()

    if (!updatedUser) {
      throw new NotFoundError('User not found')
    }

    return prepareUserResponse(updatedUser)
  },

  // TODO: Implement delete user
  /*  async deleteMe(userId: string) {
    await db.delete(users).where(eq(users.id, userId))

  }, */
}
