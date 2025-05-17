import { DataSource } from 'typeorm'
import { Patient } from './entities/Patient'
import config from './config/config'

console.log('Initializing database connection...')
console.log(`Environment: ${config.nodeEnv}`)
console.log(`Database URI: ${config.database.uri}`)
console.log(`Synchronize: ${config.database.synchronize}`)

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.uri,
  synchronize: config.database.synchronize,
  logging: ['error', 'warn', 'query'],
  logger: 'advanced-console',
  entities: [Patient],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
})
