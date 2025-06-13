import type { Config } from 'drizzle-kit'
import config from './src/config/config'

const dbUrl = new URL(config.databaseUrl)
const dbName = dbUrl.pathname.slice(1)

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 5432,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbName,
    ssl: {
      rejectUnauthorized: false,
    },
  },
} satisfies Config
