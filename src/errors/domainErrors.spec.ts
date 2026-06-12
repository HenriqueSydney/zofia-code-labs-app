import { describe, expect, it } from "vitest";
import { BusinessRuleError } from "./BusinessRuleError";
import { ConflictError } from "./ConflictError";
import { ConfigurationError } from "./ConfigurationError";
import { ExternalServiceError } from "./ExternalServiceError";
import { ForbiddenError } from "./ForbiddenError";
import { IntegrationError } from "./IntegrationError";
import { InvariantViolationError } from "./InvariantViolationError";
import { ResourceNotFoundError } from "./ResourceNotFoundError";
import { UnauthorizedError } from "./UnauthorizedError";
import { UserDoesNotHavePermissionError } from "./UserDoesNotHavePermissionError";
import { ValidationError } from "./ValidationError";

describe("Erros de domínio", () => {
  it("ValidationError deve usar status 400 por padrão", () => {
    const error = new ValidationError("Campo inválido");

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("ValidationError");
  });

  it("ResourceNotFoundError deve formatar mensagem com identificador", () => {
    const error = new ResourceNotFoundError("Cliente", { identifier: "abc-123" });

    expect(error.statusCode).toBe(404);
    expect(error.message).toContain("abc-123");
    expect(error.name).toBe("ResourceNotFoundError");
  });

  it("ResourceNotFoundError deve preservar mensagem completa", () => {
    const error = new ResourceNotFoundError("Cliente não encontrado.");

    expect(error.message).toBe("Cliente não encontrado.");
  });

  it("ResourceNotFoundError deve suffixar recurso simples", () => {
    const error = new ResourceNotFoundError("Projeto");

    expect(error.message).toBe("Projeto não encontrado(a).");
  });

  it("ConflictError deve usar status 409", () => {
    const error = new ConflictError("Registro duplicado");

    expect(error.statusCode).toBe(409);
    expect(error.name).toBe("ConflictError");
  });

  it("ForbiddenError deve usar status 403", () => {
    const error = new ForbiddenError("Sem permissão");

    expect(error.statusCode).toBe(403);
  });

  it("UnauthorizedError deve usar status 401", () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Não autorizado.");
  });

  it("BusinessRuleError deve usar severity medium por padrão", () => {
    const error = new BusinessRuleError("Operação inválida");

    expect(error.statusCode).toBe(400);
    expect(error.severity).toBe("medium");
  });

  it("IntegrationError deve usar status 404 por padrão", () => {
    const error = new IntegrationError("Integração indisponível");

    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("IntegrationError");
  });

  it("ExternalServiceError deve expor service e mensagem", () => {
    const error = new ExternalServiceError("S3", "Falha no upload");

    expect(error.message).toContain("S3");
    expect(error.name).toBe("ExternalServiceError");
  });

  it("ConfigurationError deve ser instância de AppError", () => {
    const error = new ConfigurationError("Env ausente");

    expect(error.statusCode).toBe(500);
  });

  it("InvariantViolationError deve indicar violação de invariante", () => {
    const error = new InvariantViolationError("Estado inconsistente");

    expect(error.name).toBe("InvariantViolationError");
  });

  it("UserDoesNotHavePermissionError deve incluir permissão na mensagem", () => {
    const error = new UserDoesNotHavePermissionError("client:read");

    expect(error.statusCode).toBe(403);
    expect(error.message).toContain("client:read");
  });
});
