import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("deve formatar valor em reais pt-BR", () => {
    const result = formatCurrency(1234.56);

    expect(result).toMatch(/R\$\s*1\.234,56/);
  });

  it("deve retornar traço para null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("deve retornar traço para undefined", () => {
    expect(formatCurrency(undefined as unknown as null)).toBe("—");
  });

  it("deve formatar zero", () => {
    expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
  });
});
