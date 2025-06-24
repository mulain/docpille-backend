import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// local imports
import config from '../config/config'
import { userRoleEnum } from '../db/schema'
import { JwtPayload } from '../types/jwtPayload'
import { SelectUser } from '../types/user'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateToken(
  userId: string,
  email: string,
  role: (typeof userRoleEnum.enumValues)[number]
): string {
  const payload: JwtPayload = {
    id: userId,
    email,
    role,
  }

  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload
}

export function prepareUserResponse(user: SelectUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    phoneNumber: user.phoneNumber,
    address: user.address,
    role: user.role,
  }
}
