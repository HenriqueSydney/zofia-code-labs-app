export type AppErrorParams = Record<string, string | number>;

export class AppError extends Error {
  public readonly message: string;

  public readonly statusCode: number;

  public readonly severity: "low" | "medium" | "high";

  public readonly sendSupportEmail: boolean;

  /** Chave em `errors.server` (next-intl). Quando definida, a mensagem exibida ao usuário é traduzida. */
  public readonly i18nKey?: string;

  public readonly i18nParams?: AppErrorParams;

  constructor(
    message: string,
    statusCode = 400,
    severity: "low" | "medium" | "high" = "low",
    sendSupportEmail = false,
    options?: { i18nKey?: string; i18nParams?: AppErrorParams },
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.severity = severity;
    this.sendSupportEmail = sendSupportEmail;
    this.i18nKey = options?.i18nKey;
    this.i18nParams = options?.i18nParams;
  }
}