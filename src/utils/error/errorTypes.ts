export type ErrorCode =
  | 'INDEXEDDB_OPEN_FAILED'
  | 'INDEXEDDB_QUOTA_EXCEEDED'
  | 'INDEXEDDB_TRANSACTION_FAILED'
  | 'INDEXEDDB_OPERATION_FAILED'
  | 'REACT_RENDER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'

export type ErrorContext = Record<string, unknown>

export class AppError extends Error {
  code: ErrorCode
  userMessage: string
  technicalDetails?: string
  timestamp: Date
  context?: ErrorContext

  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalDetails?: string,
    context?: ErrorContext
  ) {
    super(userMessage)
    this.name = 'AppError'
    this.code = code
    this.userMessage = userMessage
    this.technicalDetails = technicalDetails
    this.timestamp = new Date()
    this.context = context
  }
}

export class IndexedDBError extends AppError {
  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalDetails?: string,
    context?: ErrorContext
  ) {
    super(code, userMessage, technicalDetails, context)
    this.name = 'IndexedDBError'
  }
}

export class ReactError extends AppError {
  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalDetails?: string,
    context?: ErrorContext
  ) {
    super(code, userMessage, technicalDetails, context)
    this.name = 'ReactError'
  }
}

export class ValidationError extends AppError {
  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalDetails?: string,
    context?: ErrorContext
  ) {
    super(code, userMessage, technicalDetails, context)
    this.name = 'ValidationError'
  }
}

export class UnknownError extends AppError {
  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalDetails?: string,
    context?: ErrorContext
  ) {
    super(code, userMessage, technicalDetails, context)
    this.name = 'UnknownError'
  }
}

export function createAppError(
  error: unknown,
  defaultCode: ErrorCode = 'UNKNOWN_ERROR',
  defaultUserMessage = 'An unexpected error occurred. Please refresh the page.',
  context?: ErrorContext
): AppError {
  if (error instanceof AppError) {
    return error
  }

  const errorMessage =
    error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  return new UnknownError(
    defaultCode,
    defaultUserMessage,
    errorStack || errorMessage,
    context
  )
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}


