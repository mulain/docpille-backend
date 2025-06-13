import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// local imports
import * as schema from './schema'
import config from '../config/config'

const pool = new Pool({
  connectionString: config.databaseUrl,
})

export const db = drizzle(pool, { schema })
