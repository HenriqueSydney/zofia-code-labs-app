import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetFinancialOverviewUseCase } from "./GetFinancialOverviewUseCase";

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetFinancialOverviewUseCase;

describe("GetFinancialOverviewUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetFinancialOverviewUseCase(statsRepository);
  });

  it("deve retornar cards e dados do gráfico financeiro", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result.cards).toHaveLength(4);
    expect(result.cards[0].title).toBe("Receita Total");
    expect(result.chartData).toHaveLength(12);
  });

  it("deve formatar trends negativos e positivos nos cards", async () => {
    class StatsWithTrends extends InMemoryProjectStatsRepository {
      async getFinancialOverview() {
        return {
          revenue: { total: 12000, trend: -8, currentMonth: 900 },
          expenses: { total: 4000, trend: 15, currentMonth: 350 },
          netProfit: { total: 8000, trend: 0, currentMonth: 550 },
          chartData: [],
        };
      }
    }

    sut = new GetFinancialOverviewUseCase(new StatsWithTrends());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result.cards[0].trend).toBe("-8%");
    expect(result.cards[0].trendUp).toBe(false);
    expect(result.cards[2].trend).toBe("+15%");
    expect(result.cards[2].trendUp).toBe(false);
    expect(result.cards[3].trend).toBe("0%");
    expect(result.cards[3].trendUp).toBe(true);
  });

  it("deve prefixar trends positivos com + nos cards", async () => {
    class StatsWithPositiveTrends extends InMemoryProjectStatsRepository {
      async getFinancialOverview() {
        return {
          revenue: { total: 20000, trend: 12, currentMonth: 1800 },
          expenses: { total: 5000, trend: -5, currentMonth: 400 },
          netProfit: { total: 15000, trend: 8, currentMonth: 1400 },
          chartData: [],
        };
      }
    }

    sut = new GetFinancialOverviewUseCase(new StatsWithPositiveTrends());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result.cards[0].trend).toBe("+12%");
    expect(result.cards[0].trendUp).toBe(true);
    expect(result.cards[1].trend).toBe("Mês atual");
    expect(result.cards[2].trend).toBe("-5%");
    expect(result.cards[3].trend).toBe("+8%");
    expect(result.cards[3].trendUp).toBe(true);
    expect(result.cards[2].trendUp).toBe(true);
  });

  it("deve marcar trendUp false quando lucro líquido cai", async () => {
    class StatsWithNegativeProfit extends InMemoryProjectStatsRepository {
      async getFinancialOverview() {
        return {
          revenue: { total: 10000, trend: 5, currentMonth: 900 },
          expenses: { total: 6000, trend: 3, currentMonth: 500 },
          netProfit: { total: 4000, trend: -12, currentMonth: 400 },
          chartData: [],
        };
      }
    }

    sut = new GetFinancialOverviewUseCase(new StatsWithNegativeProfit());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result.cards[3].trend).toBe("-12%");
    expect(result.cards[3].trendUp).toBe(false);
  });
});
