/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorLogData } from "@/app/api/errors/errorLoggerSchema"


interface ErrorLogOptions {
  error: Error & { digest?: string }
  context?: string
  userId?: string
  metadata?: Record<string, any>
}

export function prepareLogDataForLogger({ error, context = 'unknown', userId, metadata }: ErrorLogOptions): ErrorLogData {
  const sessionId = sessionStorage.getItem('sessionId') ?? undefined
  const errorData = {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    context,
    userId,
    sessionId: sessionId,
    metadata: {
      ...metadata,
      componentStack: (error as any).componentStack
    }
  }

  return errorData

}