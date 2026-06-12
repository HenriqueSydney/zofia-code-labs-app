import { AppError, type AppErrorParams } from "./AppError";

type ValidationErrorOptions = {
  statusCode?: number;
  severity?: "low" | "medium" | "high";
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/** Dados ou entrada inválidos (400 por padrão). */
export class ValidationError extends AppError {
  constructor(message = "Dados inválidos.", options?: ValidationErrorOptions) {
    super(
      message,
      options?.statusCode ?? 400,
      options?.severity ?? "low",
      false,
      { i18nKey: options?.i18nKey, i18nParams: options?.i18nParams },
    );
    this.name = "ValidationError";
  }
}
