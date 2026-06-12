import { AppError } from "./AppError";

/** Uso incorreto de API interna (hooks, providers, etc.). */
export class InvariantViolationError extends AppError {
  constructor(message: string) {
    super(message, 500, "high");
    this.name = "InvariantViolationError";
  }
}
