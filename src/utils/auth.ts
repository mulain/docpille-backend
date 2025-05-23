import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import { UserRole } from '../types/user'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

interface TokenPayload {
  id: string
  email: string
  role: UserRole
}

export function generateToken(userId: string, email: string, role: UserRole): string {
  const payload: TokenPayload = {
    id: userId,
    email,
    role,
  }

  return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload
}
