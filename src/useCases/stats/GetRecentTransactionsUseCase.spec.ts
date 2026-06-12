import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialTransaction } from "../../repositories/IProjectStatsRepository";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetRecentTransactionsUseCase } from "./GetRecentTransactionsUseCase";

class StatsWithTransactions extends InMemoryProjectStatsRepository {
  async getRecentTransactions(
    _organizationId: string,
    limit = 20,
  ): Promise<FinancialTransaction[]> {
    const transactions: FinancialTransaction[] = [
      {
        id: randomUUID(),
        date: new Date("2024-06-01T12:00:00.000Z"),
        description: "Fatura #101",
        type: "income",
        amount: 5000,
        categoryOrClient: "Acme Corp",
        projectName: "Projeto Alpha",
        status: "confirmed",
      },
      {
        id: randomUUID(),
        date: new Date("2024-06-02T12:00:00.000Z"),
        description: "Licença software",
        type: "expense",
        amount: 350,
        categoryOrClient: "Infraestrutura",
        projectName: "Projeto Alpha",
        status: "pending",
      },
    ];

    return transactions.slice(0, limit);
  }
}

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetRecentTransactionsUseCase;

describe("GetRecentTransactionsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetRecentTransactionsUseCase(statsRepository);
  });

  it("deve retornar lista vazia quando não há transações", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toEqual([]);
  });

  it("deve retornar transações mapeadas com todos os campos", async () => {
    sut = new GetRecentTransactionsUseCase(new StatsWithTransactions());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      description: "Fatura #101",
      type: "income",
      amount: 5000,
      status: "confirmed",
    });
    expect(result[1]).toMatchObject({
      description: "Licença software",
      type: "expense",
      amount: 350,
      status: "pending",
    });
  });

  it("deve respeitar limite customizado de transações", async () => {
    sut = new GetRecentTransactionsUseCase(new StatsWithTransactions());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
      limit: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Fatura #101");
  });
});
