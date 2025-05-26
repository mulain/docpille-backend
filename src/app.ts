import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { sql } from 'drizzle-orm'

// local imports
import authRoutes from './routes/authRoutes'
import registerRoutes from './routes/registerRoutes'
import config from './config/config'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { db } from './db'

const app = express()

// Middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(requestLogger)

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/register', registerRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling
app.use(errorHandler)

export async function initialize() {
  console.log(`Frontend URL: ${config.frontendUrl}`)
  console.log(`Environment: ${config.nodeEnv}`)
  console.log(`Database: ${config.database.name}`)

  try {
    // Test database connection
    await db.execute(sql`SELECT 1`)
    console.log(`✅ Database connected: ${config.database.name}`)
    return app
  } catch (error) {
    console.error(`❌ Error connecting to: ${config.database.name}`)
    console.error(error)
    throw error
  }
}

export default app
