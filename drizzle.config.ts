import type { Config } from 'drizzle-kit'

// local imports
import config from './src/config/config'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
	url: config.databaseUrl,
  },
} as Config
