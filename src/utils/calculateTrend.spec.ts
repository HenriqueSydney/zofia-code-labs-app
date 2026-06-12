import { describe, expect, it } from "vitest";
import { calculateTrend } from "./calculateTrend";

describe("calculateTrend", () => {
  it("deve calcular variação percentual arredondada", () => {
    expect(calculateTrend(150, 100)).toBe(50);
  });

  it("deve retornar zero quando valor passado for zero", () => {
    expect(calculateTrend(100, 0)).toBe(0);
  });

  it("deve retornar zero quando valor passado for undefined", () => {
    expect(calculateTrend(100)).toBe(0);
  });

  it("deve calcular tendência negativa", () => {
    expect(calculateTrend(50, 100)).toBe(-50);
  });
});
