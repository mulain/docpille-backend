import 'dotenv/config'
import { z } from 'zod'

const NodeEnv = z.enum(['dev', 'test', 'prod'])
type NodeEnv = z.infer<typeof NodeEnv>

interface DatabaseConfig {
  uri: string
  name: string
  synchronize: boolean
  logging: boolean
}

interface JWTConfig {
  secret: string
  expiresIn: string
}

interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  fromEmail: string
}

interface Config {
  nodeEnv: NodeEnv
  port: number
  database: DatabaseConfig
  jwt: JWTConfig
  email: EmailConfig
  frontendUrl: string
}

const nodeEnv = NodeEnv.parse(process.env.NODE_ENV)

const getRequiredEnvVars = (env: NodeEnv): string[] => {
  const baseVars = [
    'PORT',
    'FRONTEND_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL',
  ]

  const databaseVar = `${env.toUpperCase()}_DATABASE_URI`
  return [...baseVars, databaseVar]
}

const requiredEnvVars = getRequiredEnvVars(nodeEnv)
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

const port = Number(process.env.PORT!)

const getDatabaseUri = (env: NodeEnv): string => {
  const uri = process.env[`${env.toUpperCase()}_DATABASE_URI`]
  if (!uri) {
    throw new Error(`Database URI not configured for environment: ${env}`)
  }
  return uri
}

const extractDatabaseName = (uri: string): string => {
  try {
    const url = new URL(uri)
    // Remove leading slash from pathname
    return url.pathname.slice(1)
  } catch (error) {
    throw new Error(`Invalid database URI format: ${uri}`)
  }
}

const databaseUri = getDatabaseUri(nodeEnv)

const config: Config = {
  nodeEnv,
  port,
  database: {
    uri: databaseUri,
    name: extractDatabaseName(databaseUri),
    synchronize: nodeEnv === 'dev',
    logging: nodeEnv === 'dev',
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN!,
  },
  email: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    fromEmail: process.env.FROM_EMAIL!,
  },
  frontendUrl: process.env.FRONTEND_URL!,
}

export default config
