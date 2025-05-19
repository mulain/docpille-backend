import { DataSource } from 'typeorm'
import { Patient } from './entities/Patient'
import config from './config/config'

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
 