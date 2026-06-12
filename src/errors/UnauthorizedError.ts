import { AppError, type AppErrorParams } from "./AppError";

type UnauthorizedErrorOptions = {
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/** Usuário não autenticado ou sessão inválida (401). */
export class UnauthorizedError extends AppError {
  constructor(
    message = "Não autorizado.",
    options?: UnauthorizedErrorOptions,
  ) {
    super(message, 401, "low", false, {
      i18nKey: options?.i18nKey,
      i18nParams: options?.i18nParams,
    });
    this.name = "UnauthorizedError";
  }
}
