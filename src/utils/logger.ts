const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const

const getTimestamp = () => new Date().toISOString()

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`\x1b[34m[${getTimestamp()}] [${LOG_LEVELS.INFO}]\x1b[0m ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`\x1b[33m[${getTimestamp()}] [${LOG_LEVELS.WARN}]\x1b[0m ${message}`, ...args)
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`\x1b[31m[${getTimestamp()}] [${LOG_LEVELS.ERROR}]\x1b[0m ${message}`, ...args)
  },
}
