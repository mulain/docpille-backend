import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// local imports
import * as schema from './schema'
import config from '../config/config'

console.log('DB URL:', config.databaseUrl)

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
})

console.log('Pool ssl config:', pool.options.ssl)
console.log('Pool connectionString:', pool.options.connectionString)

export const db = drizzle(pool, { schema })
