import { describe, expect, it } from "vitest";
import { ExternalServiceError } from "./ExternalServiceError";

describe("ExternalServiceError", () => {
  it("deve usar mensagem padrão quando detail for omitido", () => {
    const error = new ExternalServiceError("Stripe");

    expect(error.message).toBe("Falha ao comunicar com Stripe.");
    expect(error.statusCode).toBe(502);
    expect(error.sendSupportEmail).toBe(true);
  });

  it("deve prefixar detail string com nome do serviço", () => {
    const error = new ExternalServiceError("S3", "timeout na rede");

    expect(error.message).toBe("[S3] timeout na rede");
  });

  it("deve preservar detail que já começa com colchete", () => {
    const error = new ExternalServiceError("API", "[API] 503 unavailable");

    expect(error.message).toBe("[API] 503 unavailable");
  });

  it("deve formatar detail com status HTTP", () => {
    const error = new ExternalServiceError("Documenso", {
      status: 502,
      statusText: "Bad Gateway",
    });

    expect(error.message).toBe("[Documenso] 502: Bad Gateway");
  });

  it("deve formatar detail com status HTTP sem statusText", () => {
    const error = new ExternalServiceError("API", {
      status: 503,
      body: "Service Unavailable",
    });

    expect(error.message).toBe("[API] 503: Service Unavailable");
  });

  it("deve preferir statusText quando status e body estão presentes", () => {
    const error = new ExternalServiceError("GitHub", {
      status: 429,
      statusText: "Too Many Requests",
      body: "rate limit",
    });

    expect(error.message).toBe("[GitHub] 429: Too Many Requests");
  });

  it("deve formatar detail apenas com body quando status ausente", () => {
    const error = new ExternalServiceError("Resend", {
      body: "rate limit exceeded",
    });

    expect(error.message).toBe("[Resend] rate limit exceeded");
  });
});
