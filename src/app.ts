import 'reflect-metadata'
import express from 'express'
import cors from 'cors'

// local imports
import patientRoutes from './routes/patientRoutes'
import authRoutes from './routes/authRoutes'
import { AppDataSource } from './data-source'
//import { errorHandler } from './middleware/errorHandler'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling
// app.use(errorHandler)

export async function initialize() {
  console.log('Attempting to initialize database connection...')
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connection initialized successfully')
    console.log(
      'Connected entities:',
      AppDataSource.entityMetadatas.map(entity => entity.name).join(', ')
    )
    return app
  } catch (error) {
    console.error('❌ Error initializing database connection:')
    console.error(error)
    throw error
  }
}
