import { initialize } from './app'
import config from './config/config'

async function startServer() {
  try {
    const app = await initialize()
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
