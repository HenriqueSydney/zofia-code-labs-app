import { describe, expect, it } from "vitest";
import { Decimal } from "@prisma/client/runtime/client";
import { normalizePrisma } from "./normalizePrisma";

describe("normalizePrisma", () => {
  it("deve converter Decimal para number", () => {
    const value = new Decimal("123.45");

    expect(normalizePrisma(value)).toBe(123.45);
  });

  it("deve manter Date como Date", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");

    expect(normalizePrisma(date)).toBe(date);
  });

  it("deve normalizar arrays recursivamente", () => {
    const result = normalizePrisma([new Decimal(1), new Decimal(2)]);

    expect(result).toEqual([1, 2]);
  });

  it("deve normalizar objetos aninhados", () => {
    const result = normalizePrisma({
      total: new Decimal("99.90"),
      nested: { amount: new Decimal(10) },
      name: "item",
    });

    expect(result).toEqual({
      total: 99.9,
      nested: { amount: 10 },
      name: "item",
    });
  });

  it("deve retornar primitivos inalterados", () => {
    expect(normalizePrisma("texto")).toBe("texto");
    expect(normalizePrisma(42)).toBe(42);
    expect(normalizePrisma(null)).toBeNull();
  });
});
