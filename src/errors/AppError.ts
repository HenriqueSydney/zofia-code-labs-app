export class AppError extends Error {
  public readonly message: string

  public readonly statusCode: number

  public readonly severity: 'low' | 'medium' | 'high'

  public readonly sendSupportEmail: boolean

  constructor(
    message: string,
    statusCode = 400,
    severity: 'low' | 'medium' | 'high' = 'low',
    sendSupportEmail = false,
  ) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.severity = severity
    this.sendSupportEmail = sendSupportEmail
  }
}