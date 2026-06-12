import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "./AppError";
import { handleErrors } from "./handleErrors";
import { apiLogger } from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
  apiLogger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("handleErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar mensagem de AppError", () => {
    const error = new AppError("Erro de negócio", 400);

    expect(handleErrors(error)).toBe("Erro de negócio");
    expect(apiLogger.warn).toHaveBeenCalled();
  });

  it("deve retornar mensagem genérica para valor não-Error", () => {
    expect(handleErrors("string")).toBe("Unexpected error");
    expect(handleErrors(null)).toBe("Unexpected error");
  });

  it("deve retornar mensagem de Error comum", () => {
    expect(handleErrors(new Error("Falha inesperada"))).toBe("Falha inesperada");
    expect(apiLogger.error).toHaveBeenCalled();
  });

  it("deve tratar erro Prisma conhecido via handlePrismaErrors", () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "7.0.0",
    });

    const message = handleErrors(prismaError, "trace-abc");

    expect(message).toContain("já existe");
    expect(apiLogger.warn).toHaveBeenCalled();
  });

  it("deve registrar erro Prisma com statusCode 500 via apiLogger.error", () => {
    const prismaError = new Prisma.PrismaClientInitializationError(
      "Can't reach database",
      "7.0.0",
    );

    const message = handleErrors(prismaError, "trace-500");

    expect(message).toContain("Ooops!");
    expect(apiLogger.error).toHaveBeenCalled();
    expect(apiLogger.warn).not.toHaveBeenCalled();
  });

  it("deve tratar PrismaClientUnknownRequestError com status 500 via error", () => {
    const prismaError = new Prisma.PrismaClientUnknownRequestError(
      "Engine panic",
      { clientVersion: "7.0.0" },
    );

    const message = handleErrors(prismaError, "trace-unknown");

    expect(message).toContain("Ooops!");
    expect(apiLogger.error).toHaveBeenCalled();
    expect(apiLogger.warn).not.toHaveBeenCalled();
  });

  it("deve tratar ZodError retornando statusCode e message", () => {
    const schema = z.object({ email: z.string().email("invalidEmail") });
    let zodError: z.ZodError | undefined;

    try {
      schema.parse({ email: "invalido" });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    const result = handleErrors(zodError!, null, { message: "Formulário:" });

    expect(result).toMatchObject({
      statusCode: 400,
      message: "Formulário:",
    });
    expect(apiLogger.warn).toHaveBeenCalled();
  });

  it("deve usar moreInfo.message quando informado", () => {
    const error = new AppError("Original");

    expect(handleErrors(error, null, { message: "Custom" })).toBe("Custom");
  });

  it("deve tratar Error sem stack trace", () => {
    const error = new Error("Sem stack");
    Object.defineProperty(error, "stack", { value: undefined });

    expect(handleErrors(error)).toBe("Sem stack");
    expect(apiLogger.error).toHaveBeenCalled();
  });
});
