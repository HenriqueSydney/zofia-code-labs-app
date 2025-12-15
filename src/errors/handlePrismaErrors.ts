import { Prisma } from "@/generated/prisma/client";
import { TraceId } from "./handleErrors";

const UNKNOWN_ERROR =
  "Ooops! Alguma coisa não está correta. A equipe de desenvolvimento foi notificada. Tente novamente mais tarde.";

type PrismaErrorLog = {
  errorMessage: string;
  instance: string;
  errorName: string;
  code?: unknown;
  traceId: TraceId;
  statusCode: number;
  severity: "HIGH";
  stack?: string;
};

export function handlePrismaErrors(
  error: Error,
  traceId: TraceId
): PrismaErrorLog | null {
  const stackTrace = error.stack?.replace(/\n/g, " ") ?? "";

  switch (true) {
    case error instanceof Prisma.PrismaClientKnownRequestError: {
      let message = "";

      switch (error.code) {
        case "P2000":
          message = `O valor para o campo ${error.message.split(":")[1]}`;
          break;
        case "P2001":
          message =
            "Opss! Desculpe, mas não conseguimos localizar um registro associado a consulta.";
          break;
        case "P2002":
          message =
            "O registro informado já existe no banco de dados. Confira as informações e tente novamente";
          break;
        case "P2003":
          message = `Opss! O campo ${
            error.message.split(":")[1]
          } possui uma restrição vinculada a outra tabela de nosso banco de dados.`;
          break;
        case "P2004":
          message = "Opss! Encontramos uma restrição na base de dados.";
          break;
        default:
          message =
            "Um erro relacionado à nossa base de dados ocorreu. Tente novamente mais tarde.";
      }

      return {
        errorMessage: `[ERROR][PRISMA][${error.name}][${error.message}]${message}`,
        instance: "Prisma.PrismaClientKnownRequestError",
        errorName: error.name,
        code: error.meta,
        traceId,
        severity: "HIGH",
        statusCode: 400,
        stack: stackTrace,
      };
    }

    case error instanceof Prisma.PrismaClientUnknownRequestError:
      return {
        errorMessage: `[ERROR][PRISMA][${error.name}][${error.message}]${UNKNOWN_ERROR}`,
        instance: "Prisma.PrismaClientUnknownRequestError",
        errorName: error.name,
        traceId,
        statusCode: 500,
        severity: "HIGH",
        stack: stackTrace,
      };

    case error instanceof Prisma.PrismaClientInitializationError:
      return {
        errorMessage: `[ERROR][PRISMA][${error.name}][${error.message}]${UNKNOWN_ERROR}`,
        instance: "Prisma.PrismaClientInitializationError",
        errorName: error.name,
        traceId,
        statusCode: 500,
        severity: "HIGH",
        stack: stackTrace,
      };

    case error instanceof Prisma.PrismaClientRustPanicError:
      return {
        errorMessage: `[ERROR][PRISMA][${error.name}][${error.message}]${UNKNOWN_ERROR}`,
        instance: "Prisma.PrismaClientRustPanicError",
        errorName: error.name,
        traceId,
        statusCode: 500,
        severity: "HIGH",
        stack: stackTrace,
      };

    case error instanceof Prisma.PrismaClientValidationError: {
      const message = `Oops! Encontramos um erro nos dados que estão tentando ser salvos na base de dados. Parece que alguma 
            das informações é incompatível com nossa Tabela. Verifique as informações e, se for o caso, abra um Ticket para atendimento`;

      return {
        errorMessage: `[ERROR][PRISMA][${error.name}][${error.message}]${message}`,
        instance: "Prisma.PrismaClientValidationError",
        errorName: error.name,
        traceId,
        statusCode: 400,
        severity: "HIGH",
        stack: stackTrace,
      };
    }

    default:
      return null;
  }
}
