import { config as dotenvConfig } from 'dotenv'
import { z } from 'zod'

dotenvConfig()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().optional(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: z.string().email(),
})

const parsedEnv = envSchema.parse(process.env)

const config = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT ?? 3000,
  frontendUrl: parsedEnv.FRONTEND_URL,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  email: {
    host: parsedEnv.SMTP_HOST,
    port: parsedEnv.SMTP_PORT,
    user: parsedEnv.SMTP_USER,
    pass: parsedEnv.SMTP_PASS,
    fromEmail: parsedEnv.FROM_EMAIL,
  },
}

export default config
