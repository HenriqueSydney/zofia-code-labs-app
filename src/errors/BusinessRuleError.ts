import { AppError, type AppErrorParams } from "./AppError";

type BusinessRuleErrorOptions = {
  statusCode?: number;
  severity?: "low" | "medium" | "high";
  i18nKey?: string;
  i18nParams?: AppErrorParams;
};

/** Regra de negócio violada — operação não permitida no estado atual. */
export class BusinessRuleError extends AppError {
  constructor(message: string, options?: BusinessRuleErrorOptions) {
    super(
      message,
      options?.statusCode ?? 400,
      options?.severity ?? "medium",
      false,
      { i18nKey: options?.i18nKey, i18nParams: options?.i18nParams },
    );
    this.name = "BusinessRuleError";
  }
}
