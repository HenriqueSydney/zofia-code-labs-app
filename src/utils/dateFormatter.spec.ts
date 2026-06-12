import { describe, expect, it } from "vitest";
import { ValidationError } from "../errors";
import { formatDate, localeMap } from "./dateFormatter";

describe("localeMap", () => {
  it("deve mapear locales curtos para BCP 47", () => {
    expect(localeMap.pt).toBe("pt-BR");
    expect(localeMap.en).toBe("en-US");
  });
});

describe("formatDate", () => {
  it("deve formatar data no padrão pt-BR", () => {
    const date = new Date("2024-06-15T15:00:00.000Z");

    const result = formatDate(date, "pt");

    expect(result).toMatch(/15\/06\/2024/);
  });

  it("deve aceitar string ISO como entrada", () => {
    const result = formatDate("2024-01-10T12:00:00.000Z", "pt");

    expect(result).toMatch(/10\/01\/2024/);
  });

  it("deve usar opções customizadas de formatação", () => {
    const date = new Date("2024-06-15T12:00:00.000Z");

    const result = formatDate(date, "pt", { year: "numeric", month: "long" });

    expect(result).toContain("2024");
    expect(result.toLowerCase()).toMatch(/junho|june/);
  });

  it("deve lançar ValidationError para data inválida", () => {
    expect(() => formatDate("data-invalida", "pt")).toThrow(ValidationError);
  });

  it("deve usar locale BCP 47 diretamente quando não estiver no mapa", () => {
    const date = new Date("2024-06-15T12:00:00.000Z");

    const result = formatDate(date, "fr-FR");

    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });
});
