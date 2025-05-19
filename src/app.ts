import 'reflect-metadata'
import express from 'express'
import cors from 'cors'

// local imports
import patientRoutes from './routes/patientRoutes'
import authRoutes from './routes/authRoutes'
import registerRoutes from './routes/registerRoutes'
import { AppDataSource } from './data-source'
import config from './config/config'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/register', registerRoutes)
app.use('/api/v1/patients', patientRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling
app.use(errorHandler)

export async function initialize() {
  console.log('Initializing database connection...')
  console.log(`Environment: ${config.nodeEnv}`)
  console.log(`Database: ${config.database.name}`)
  console.log(`Synchronize: ${config.database.synchronize}`)

  try {
    await AppDataSource.initialize()
    console.log(`✅ Database connected: ${config.database.name}`)
    console.log(
      'Connected entities:',
      AppDataSource.entityMetadatas.map(entity => entity.name).join(', ')
    )
    return app
  } catch (error) {
    console.error(`❌ Error connecting to: ${config.database.name}`)
    console.error(error)
    throw error
  }
}

export default app
