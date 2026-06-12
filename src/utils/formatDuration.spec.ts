import { describe, expect, it } from "vitest";
import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it("deve retornar 0s para zero segundos", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("deve formatar apenas segundos quando menor que um minuto", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("deve formatar minutos e segundos arredondados", () => {
    expect(formatDuration(90)).toBe("1m 30s");
  });

  it("deve arredondar segundos restantes", () => {
    expect(formatDuration(59.6)).toBe("60s");
  });
});
