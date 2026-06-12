import { AppError, type AppErrorParams } from "./AppError";

type ConflictErrorOptions = {
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/** Conflito de estado — ex.: registro duplicado (409). */
export class ConflictError extends AppError {
  constructor(message: string, options?: ConflictErrorOptions) {
    super(message, 409, "low", false, {
      i18nKey: options?.i18nKey,
      i18nParams: options?.i18nParams,
    });
    this.name = "ConflictError";
  }
}
