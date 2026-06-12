import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetFinancialProjectionsUseCase } from "./GetFinancialProjectionsUseCase";

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetFinancialProjectionsUseCase;

describe("GetFinancialProjectionsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetFinancialProjectionsUseCase(statsRepository);
  });

  it("deve retornar projeções financeiras formatadas", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result.revenue).toContain("R$");
    expect(result.expenses).toContain("R$");
    expect(result.profit).toContain("R$");
    expect(result.isProfitPositive).toBe(true);
  });

  it("deve indicar lucro negativo quando despesas superam receitas", async () => {
    class StatsWithNegativeProfit extends InMemoryProjectStatsRepository {
      async getFinancialProjections() {
        return {
          projectedRevenue: 8000,
          projectedExpenses: 12000,
        };
      }
    }

    sut = new GetFinancialProjectionsUseCase(new StatsWithNegativeProfit());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result.isProfitPositive).toBe(false);
    expect(result.profit).toContain("-");
  });
});
