import { eq } from 'drizzle-orm'
import { UpdateProfileDTO } from '@m-oss/types'

// local imports
import { db } from '../db'
import { users } from '../db/schema'
import { prepareUserResponse } from '../utils/auth'

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

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    return prepareUserResponse(updatedUser)
  },

  // TODO: Implement delete user
 /*  async deleteMe(userId: string) {
    await db.delete(users).where(eq(users.id, userId))

  }, */
}
