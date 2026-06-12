import { AppError, type AppErrorParams } from "./AppError";

type IntegrationErrorOptions = {
  statusCode?: number;
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/** Erros relacionados a integrações (catálogo, projeto, credenciais). */
export class IntegrationError extends AppError {
  constructor(message: string, options?: IntegrationErrorOptions) {
    super(message, options?.statusCode ?? 404, "low", false, {
      i18nKey: options?.i18nKey,
      i18nParams: options?.i18nParams,
    });
    this.name = "IntegrationError";
  }
}
