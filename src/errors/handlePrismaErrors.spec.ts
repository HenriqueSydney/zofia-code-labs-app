import { describe, expect, it, vi } from "vitest";
import { Prisma } from "../generated/prisma/client";
import { handlePrismaErrors } from "./handlePrismaErrors";

describe("handlePrismaErrors", () => {
  it("deve retornar null para erro genérico", () => {
    const result = handlePrismaErrors(new Error("generic"), null);

    expect(result).toBeNull();
  });

  it("deve mapear P2002 para mensagem de duplicidade", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "7.0.0" },
    );

    const result = handlePrismaErrors(error, "trace-1");

    expect(result?.statusCode).toBe(400);
    expect(result?.errorMessage).toContain("já existe");
    expect(result?.instance).toBe("Prisma.PrismaClientKnownRequestError");
  });

  it("deve mapear P2001 para registro não encontrado", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2001",
      clientVersion: "7.0.0",
    });

    const result = handlePrismaErrors(error, null);

    expect(result?.errorMessage).toContain("não conseguimos localizar");
  });

  it("deve mapear PrismaClientValidationError", () => {
    const error = new Prisma.PrismaClientValidationError("Validation failed", {
      clientVersion: "7.0.0",
    });

    const result = handlePrismaErrors(error, null);

    expect(result?.statusCode).toBe(400);
    expect(result?.instance).toBe("Prisma.PrismaClientValidationError");
  });

  it("deve mapear PrismaClientUnknownRequestError com status 500", () => {
    const error = new Prisma.PrismaClientUnknownRequestError("Unknown", {
      clientVersion: "7.0.0",
    });

    const result = handlePrismaErrors(error, null);

    expect(result?.statusCode).toBe(500);
    expect(result?.severity).toBe("HIGH");
  });

  it("deve mapear P2000 com campo na mensagem", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Value too long: email",
      { code: "P2000", clientVersion: "7.0.0" },
    );

    const result = handlePrismaErrors(error, null);

    expect(result?.errorMessage).toContain("email");
  });

  it("deve mapear P2003 para restrição de FK", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Foreign key: clientId",
      { code: "P2003", clientVersion: "7.0.0" },
    );

    const result = handlePrismaErrors(error, null);

    expect(result?.errorMessage).toContain("clientId");
  });

  it("deve mapear P2004 para restrição genérica", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Constraint", {
      code: "P2004",
      clientVersion: "7.0.0",
    });

    const result = handlePrismaErrors(error, null);

    expect(result?.errorMessage).toContain("restrição");
  });

  it("deve mapear código Prisma desconhecido com mensagem genérica", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unknown code", {
      code: "P9999",
      clientVersion: "7.0.0",
    });

    const result = handlePrismaErrors(error, null);

    expect(result?.errorMessage).toContain("base de dados");
  });

  it("deve mapear PrismaClientInitializationError", () => {
    const error = new Prisma.PrismaClientInitializationError(
      "Can't reach database",
      "7.0.0",
    );

    const result = handlePrismaErrors(error, null);

    expect(result?.statusCode).toBe(500);
    expect(result?.instance).toBe("Prisma.PrismaClientInitializationError");
  });

  it("deve mapear PrismaClientRustPanicError", () => {
    const error = new Prisma.PrismaClientRustPanicError("panic", "7.0.0");

    const result = handlePrismaErrors(error, null);

    expect(result?.statusCode).toBe(500);
    expect(result?.instance).toBe("Prisma.PrismaClientRustPanicError");
  });

  it("deve tratar erro Prisma sem stack trace", () => {
    const error = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "7.0.0",
    });
    Object.defineProperty(error, "stack", { value: undefined });

    const result = handlePrismaErrors(error, null);

    expect(result?.stack).toBe("");
    expect(result?.errorMessage).toContain("já existe");
  });
});
