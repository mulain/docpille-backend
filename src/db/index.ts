import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// local imports
import * as schema from './schema'
import config from '../config/config'

console.log('DB URL:', config.databaseUrl)
console.log('Using ssl.rejectUnauthorized = false')

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
})

export const db = drizzle(pool, { schema })
