import { AppError } from "./AppError";

type ExternalServiceDetail =
  | string
  | { status?: number; statusText?: string; body?: string };

/**
 * Falha em serviço externo (API de terceiros, storage, etc.).
 */
export class ExternalServiceError extends AppError {
  constructor(serviceName: string, detail?: ExternalServiceDetail) {
    let message: string;

    if (detail == null) {
      message = `Falha ao comunicar com ${serviceName}.`;
    } else if (typeof detail === "string") {
      message = detail.startsWith("[")
        ? detail
        : `[${serviceName}] ${detail}`;
    } else {
      const status = detail.status ?? "";
      const statusText = detail.statusText ?? detail.body ?? "";
      message =
        status !== ""
          ? `[${serviceName}] ${status}: ${statusText}`.trim()
          : `[${serviceName}] ${statusText}`.trim();
    }

    super(message, 502, "medium", true);
    this.name = "ExternalServiceError";
  }
}
