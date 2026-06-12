import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { GetFinancialMetricsUseCase } from "./GetFinancialMetricsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: GetFinancialMetricsUseCase;

describe("GetFinancialMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetFinancialMetricsUseCase(statsRepository, projectsRepository);
  });

  it("deve retornar métricas financeiras formatadas do projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    vi.spyOn(statsRepository, "getFinancialMetrics").mockResolvedValueOnce({
      totalReceived: 10000,
      totalExpenses: 3000,
      netResult: 7000,
      monthlyHistory: [{ month: "Mai", revenue: 10000, expenses: 3000 }],
      trends: { received: 10, expenses: -5 },
    });

    const result = await sut.execute({
      projectSlug: "projeto-alpha",
      userId,
    });

    expect(result.cards.totalReceived).toContain("10.000");
    expect(result.cards.totalExpenses).toContain("3.000");
    expect(result.chartData).toHaveLength(1);
  });

  it("não deve retornar métricas de projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        projectSlug: "inexistente",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
