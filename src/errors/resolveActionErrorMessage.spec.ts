import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "./ValidationError";

vi.mock("@/lib/logger", () => ({
  apiLogger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/i18n/resolveErrorMessage", () => ({
  resolveErrorMessage: vi.fn(),
  resolveSuccessMessage: vi.fn(),
}));

import { apiLogger } from "@/lib/logger";
import { resolveErrorMessage } from "../lib/i18n/resolveErrorMessage";
import {
  resolveActionErrorMessage,
  serverErrorMessage,
} from "./resolveActionErrorMessage";

describe("resolveActionErrorMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveErrorMessage).mockImplementation(async (input) => {
      if (input instanceof ValidationError) {
        return `[i18n] ${input.message}`;
      }
      return "fallback";
    });
  });

  it("deve registrar erro e traduzir com base no erro recebido", async () => {
    const error = new ValidationError("campo obrigatório");

    const message = await resolveActionErrorMessage(error);

    expect(message).toBe("[i18n] campo obrigatório");
    expect(apiLogger.warn).toHaveBeenCalled();
    expect(resolveErrorMessage).toHaveBeenCalledWith(error);
  });
});

describe("serverErrorMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveErrorMessage).mockImplementation(async (key, params) => {
      return `${String(key)}:${params?.name ?? "anon"}`;
    });
  });

  it("deve repassar chave e params para resolveErrorMessage", async () => {
    const message = await serverErrorMessage("unauthorized", { name: "Admin" });

    expect(resolveErrorMessage).toHaveBeenCalledWith("unauthorized", {
      name: "Admin",
    });
    expect(message).toBe("unauthorized:Admin");
  });
});
