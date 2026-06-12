import { describe, expect, it } from "vitest";
import { normalizeString } from "./normalizeString";

describe("normalizeString", () => {
  it("deve remover acentos de caracteres latinos", () => {
    const result = normalizeString("ação café naïve");

    expect(result).toBe("acao cafe naive");
  });

  it("deve retornar string vazia quando entrada for vazia", () => {
    expect(normalizeString("")).toBe("");
  });

  it("deve manter caracteres sem diacríticos inalterados", () => {
    expect(normalizeString("abc-123_xyz")).toBe("abc-123_xyz");
  });
});
