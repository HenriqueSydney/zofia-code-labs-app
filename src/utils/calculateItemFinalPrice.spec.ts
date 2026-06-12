import { describe, expect, it } from "vitest";
import { DiscountType } from "../generated/prisma/enums";
import {
  calculateItemFinalPrice,
  calculateProposalTotal,
} from "./calculateItemFinalPrice";

describe("calculateItemFinalPrice", () => {
  it("deve aplicar desconto percentual", () => {
    const result = calculateItemFinalPrice({
      price: 100,
      discount: 10,
      discountType: DiscountType.PERCENTAGE,
    });

    expect(result).toBe(90);
  });

  it("deve aplicar desconto fixo", () => {
    const result = calculateItemFinalPrice({
      price: 100,
      discount: 15,
      discountType: DiscountType.FIXED,
    });

    expect(result).toBe(85);
  });
});

describe("calculateProposalTotal", () => {
  it("deve somar finalPrice de todos os itens", () => {
    const total = calculateProposalTotal([
      { finalPrice: 100 },
      { finalPrice: 250 },
    ] as Parameters<typeof calculateProposalTotal>[0]);

    expect(total).toBe(350);
  });

  it("deve retornar zero para lista vazia", () => {
    expect(calculateProposalTotal([])).toBe(0);
  });
});
