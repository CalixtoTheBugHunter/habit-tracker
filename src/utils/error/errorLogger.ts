import type { AppError, ErrorContext } from './errorTypes'
import { storeError } from './errorStorage'

export interface ErrorLogger {
  logError(error: AppError, context?: ErrorContext): void
  logWarning(error: AppError, context?: ErrorContext): void
}

class ConsoleErrorLogger implements ErrorLogger {
  logError(error: AppError, context?: ErrorContext): void {
    const logMessage = `[${error.code}] ${error.userMessage}`
    if (context) {
      console.error(logMessage, context)
    } else {
      console.error(logMessage)
    }
  }

  logWarning(error: AppError, context?: ErrorContext): void {
    const logMessage = `[${error.code}] ${error.userMessage}`
    if (context) {
      console.error(logMessage, context)
    } else {
      console.error(logMessage)
    }
  }
}

const logger: ErrorLogger = new ConsoleErrorLogger()

export function logError(error: AppError, context?: ErrorContext): void {
  logger.logError(error, context)
  storeError(error)
}

export function logWarning(error: AppError, context?: ErrorContext): void {
  logger.logWarning(error, context)
  storeError(error)
}


