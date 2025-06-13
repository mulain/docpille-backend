import type { Config } from 'drizzle-kit'
import config from './src/config/config'

// Parse the database URI to get connection details
const dbUrl = new URL(config.databaseUrl)
const dbName = dbUrl.pathname.slice(1)

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbName,
    ssl: {
      rejectUnauthorized: false, // This will allow self-signed certificates
    },
  },
} satisfies Config
