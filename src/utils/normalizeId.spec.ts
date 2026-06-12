import { describe, expect, it } from "vitest";
import { normalizeId } from "./normalizeId";

describe("normalizeId", () => {
  it("deve normalizar texto para identificador em snake_case", () => {
    const result = normalizeId("Café com Leite");

    expect(result).toBe("cafe_com_leite");
  });

  it("deve remover caracteres especiais", () => {
    const result = normalizeId("Item #1 (novo)");

    expect(result).toBe("item_1_novo");
  });

  it("deve converter espaços múltiplos em um único underscore", () => {
    expect(normalizeId("foo   bar")).toBe("foo_bar");
  });
});
