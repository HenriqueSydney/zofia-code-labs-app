import { AppError, type AppErrorParams } from "./AppError";

type ResourceNotFoundOptions = {
  identifier?: string;
  statusCode?: number;
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/**
 * Recurso inexistente (404). Aceita mensagem completa ou nome do recurso + identificador opcional.
 */
export class ResourceNotFoundError extends AppError {
  constructor(messageOrResource: string, options?: ResourceNotFoundOptions) {
    const message =
      options?.identifier != null
        ? `${messageOrResource} não encontrado(a): ${options.identifier}`
        : messageOrResource.includes("não encontrad") ||
            messageOrResource.includes("not found") ||
            messageOrResource.includes("não localizad") ||
            messageOrResource.endsWith(".")
          ? messageOrResource
          : `${messageOrResource} não encontrado(a).`;

    super(message, options?.statusCode ?? 404, "low", false, {
      i18nKey: options?.i18nKey,
      i18nParams: options?.i18nParams,
    });
    this.name = "ResourceNotFoundError";
  }
}
