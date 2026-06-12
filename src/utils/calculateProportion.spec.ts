import { describe, expect, it } from "vitest";
import { calculateProportion } from "./calculateProportion";

describe("calculateProportion", () => {
  it("deve calcular percentual com duas casas decimais", () => {
    expect(calculateProportion(200, 50)).toBe(25);
  });

  it("deve retornar zero quando total for zero", () => {
    expect(calculateProportion(0, 50)).toBe(0);
  });

  it("deve retornar zero quando total for undefined ou falsy", () => {
    expect(calculateProportion(0, 10)).toBe(0);
  });

  it("deve arredondar para duas casas decimais", () => {
    expect(calculateProportion(3, 1)).toBe(33.33);
  });
});
