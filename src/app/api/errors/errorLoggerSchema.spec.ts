import { describe, expect, it } from "vitest";
import { errorLoggerSchema } from "./errorLoggerSchema";

function createValidPayload(overrides: Record<string, unknown> = {}) {
  return {
    message: "Erro inesperado na aplicação",
    url: "https://app.zofia.com.br/dashboard",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("errorLoggerSchema", () => {
  describe("parse", () => {
    it("deve aceitar payload válido com campos obrigatórios", () => {
      const payload = createValidPayload();

      const result = errorLoggerSchema.parse(payload);

      expect(result.message).toBe(payload.message);
      expect(result.url).toBe(payload.url);
      expect(result.userAgent).toBe(payload.userAgent);
      expect(result.timestamp).toBe(payload.timestamp);
    });

    it("deve aceitar payload válido com campos opcionais", () => {
      const payload = createValidPayload({
        stack: "Error: test\n    at main.js:1:1",
        digest: "abc123-def_456",
        context: "dashboard",
        userId: "user_123",
        sessionId: "session-abc",
        metadata: { feature: "backlog" },
      });

      const result = errorLoggerSchema.parse(payload);

      expect(result.stack).toBe(payload.stack);
      expect(result.digest).toBe(payload.digest);
      expect(result.context).toBe(payload.context);
      expect(result.userId).toBe(payload.userId);
      expect(result.sessionId).toBe(payload.sessionId);
      expect(result.metadata).toEqual({ feature: "backlog" });
    });
  });

  describe("safeParse", () => {
    it("deve rejeitar message vazia", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ message: "" }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Message cannot be empty");
      }
    });

    it("deve rejeitar message com mais de 1000 caracteres", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ message: "a".repeat(1001) }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Message too long");
      }
    });

    it("deve rejeitar url inválida", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ url: "not-a-valid-url" }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid URL format");
      }
    });

    it("deve rejeitar userAgent vazio", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ userAgent: "" }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "User agent cannot be empty",
        );
      }
    });

    it("deve rejeitar timestamp com formato inválido", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ timestamp: "2026-05-31" }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid ISO timestamp");
      }
    });

    it("deve rejeitar timestamp com mais de 24 horas", () => {
      const oldTimestamp = new Date(
        Date.now() - 25 * 60 * 60 * 1000,
      ).toISOString();

      const result = errorLoggerSchema.safeParse(
        createValidPayload({ timestamp: oldTimestamp }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Timestamp too old (max 24h)",
        );
      }
    });

    it("deve rejeitar digest com formato inválido", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ digest: "digest inválido!" }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid digest format");
      }
    });

    it("deve rejeitar userId com formato inválido", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ userId: "user@123" }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid user ID format");
      }
    });

    it("deve rejeitar stack com mais de 5000 caracteres", () => {
      const result = errorLoggerSchema.safeParse(
        createValidPayload({ stack: "x".repeat(5001) }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Stack trace too long");
      }
    });
  });
});
