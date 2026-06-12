import { AppError, type AppErrorParams } from "./AppError";

type ForbiddenErrorOptions = {
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/** Acesso negado — autenticado sem permissão (403). */
export class ForbiddenError extends AppError {
  constructor(message: string, options?: ForbiddenErrorOptions) {
    super(message, 403, "low", false, {
      i18nKey: options?.i18nKey,
      i18nParams: options?.i18nParams,
    });
    this.name = "ForbiddenError";
  }
}
