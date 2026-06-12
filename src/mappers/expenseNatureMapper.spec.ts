import { describe, expect, it } from "vitest";
import {
  expenseNatureMapper,
  getExpenseNatureLabel,
  getExpenseNatureOptions,
} from "./expenseNatureMapper";

describe("expenseNatureMapper", () => {
  const t = (key: string) => `nature:${key}`;

  it("deve conter detalhes para todas as naturezas de despesa", () => {
    expect(Object.keys(expenseNatureMapper)).toEqual(
      expect.arrayContaining([
        "OPERATIONAL",
        "DIRECT_PROJECT",
        "INVESTMENT",
        "PERSONAL",
      ]),
    );
    expect(expenseNatureMapper.OPERATIONAL.icon).toBeDefined();
    expect(expenseNatureMapper.DIRECT_PROJECT.badge).toContain("primary");
  });

  it("deve traduzir label da natureza", () => {
    expect(getExpenseNatureLabel("INVESTMENT", t)).toBe("nature:investment");
    expect(getExpenseNatureLabel("PERSONAL", t)).toBe("nature:personal");
  });

  it("deve gerar opções com value, label e ícone", () => {
    const options = getExpenseNatureOptions(t);

    expect(options).toHaveLength(4);
    expect(options.find((o) => o.value === "OPERATIONAL")?.label).toBe(
      "nature:operational",
    );
    expect(options.every((o) => o.icon)).toBe(true);
  });
});
