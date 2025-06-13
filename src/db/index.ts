import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// local imports
import * as schema from './schema'
import config from '../config/config'

console.log(config.databaseUrl)

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: true,
})

export const db = drizzle(pool, { schema })
