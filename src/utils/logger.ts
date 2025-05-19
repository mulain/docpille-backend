const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS]

const getTimestamp = () => new Date().toISOString()

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[${getTimestamp()}] [${LOG_LEVELS.INFO}] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[${getTimestamp()}] [${LOG_LEVELS.WARN}] ${message}`, ...args)
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[${getTimestamp()}] [${LOG_LEVELS.ERROR}] ${message}`, ...args)
  },
}
