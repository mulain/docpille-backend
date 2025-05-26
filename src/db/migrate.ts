import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

// local imports
import config from '../config/config'

const runMigration = async () => {
  const pool = new Pool({
    connectionString: config.database.uri,
  })

  const db = drizzle(pool)

  console.log('Running migrations...')

  await migrate(db, { migrationsFolder: 'drizzle' })

  console.log('Migrations completed!')

  await pool.end()
}

runMigration().catch(err => {
  console.error('Migration failed!')
  console.error(err)
  process.exit(1)
})
