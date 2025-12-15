import { describe, it, expect, vi } from "vitest";
import pino from "pino";

// Mock do pino
vi.mock("pino", () => ({
  default: vi.fn(() => ({ info: vi.fn(), error: vi.fn() })),
}));

import { webLogger, apiLogger } from "./logger"; // ajuste o path

describe("Logger", () => {
  it("should create webLogger and apiLogger instances", () => {
    // Verifica se pino foi chamado duas vezes
    expect(pino).toHaveBeenCalledTimes(2);

    // Verifica se os prefixos foram aplicados
    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({ msgPrefix: "[WEB] " })
    );
    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({ msgPrefix: "[API] " })
    );

    // Verifica se os loggers têm método info
    expect(webLogger.info).toBeTypeOf("function");
    expect(apiLogger.error).toBeTypeOf("function");
  });
});
