import { apiLogger } from "@/lib/logger";
import { AppError } from "./AppError";
import { ZodError } from "zod";
import { handlePrismaErrors } from "./handlePrismaErrors";

export type TraceId =
  | `${string}-${string}-${string}-${string}-${string}`
  | null;

export function handleErrors(
  error: unknown,
  traceId: TraceId = null,
  moreInfo: any = {}
) {
  if (error instanceof Error) {
    const message = moreInfo.message ?? error.message;
    const stackTrace = error.stack?.replace(/\n/g, " ") ?? "";
    if (error instanceof AppError) {
      apiLogger.warn(
        {
          traceId,
          instance: "AppError",
          ...error,
          stack: stackTrace,
          ...moreInfo,
          errorMessage: error.message,
        },
        `[ERROR][APP-ERROR][${error.name}]${message}`
      );
      return message;
    }

    const prismaError = handlePrismaErrors(error, traceId);

    if (prismaError) {
      const errorInfo = { ...prismaError, ...moreInfo };
      if (prismaError.code === 500) {
        apiLogger.error(errorInfo, prismaError.errorMessage);
        return prismaError.errorMessage;
      }
      apiLogger.warn(errorInfo, prismaError.errorMessage);
      return prismaError.errorMessage;
    }

    if (error instanceof ZodError) {
      let zodMessage = "Identificado o(s) seguinte(s) erros de formulário:";
      JSON.parse(error.message).forEach((err: { message: string }) => {
        zodMessage = `${message} ${err.message};`;
      });
      apiLogger.warn(
        {
          instance: "ZodError",
          extraInfo: {
            errorName: error.name,
          },
          severity: "LOW",
          traceId,
          stackTrace,
          ...moreInfo,
          errorMessage: error.message,
          zodMessage: `[ERROR][ZOD-ERROR][${error.name}]${zodMessage}`,
        },
        zodMessage
      );
      return {
        statusCode: 400,
        message,
      };
    }

    apiLogger.error(
      {
        traceId,
        stack: stackTrace,
      },
      `[ERROR][${error.name}]${error.message}`
    );
    return error.message;
  }

  return "Unexpected error";
}
