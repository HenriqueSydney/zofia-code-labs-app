import { AppError } from "./AppError";

/** Configuração ou variáveis de ambiente inválidas. */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, "high", true);
    this.name = "ConfigurationError";
  }
}
