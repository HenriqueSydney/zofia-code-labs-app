import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { date } from "../../lib/dayjs";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetCommercialStatsUseCase } from "./GetCommercialStatsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: GetCommercialStatsUseCase;

describe("GetCommercialStatsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetCommercialStatsUseCase(statsRepository, projectsRepository);
  });

  it("deve retornar cards comerciais do projeto", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const now = date().toDate();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: randomUUID(),
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(10000),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(10000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await sut.execute({
      projectSlug: "projeto-alpha",
      userId: randomUUID(),
    });

    expect(result.cards.proposals.count).toBe(0);
    expect(result.cards.contracts.count).toBe(0);
    expect(result.cards.financials.received).toContain("R$");
  });

  it("deve formatar cards com métricas comerciais preenchidas", async () => {
    class StatsWithCommercialData extends InMemoryProjectStatsRepository {
      async getCommercialMetrics() {
        return {
          proposals: { count: 3, openValue: 45000, wonValue: 120000 },
          contracts: { activeCount: 2, totalValue: 80000 },
          financials: {
            netResult: 35000,
            totalReceived: 95000,
            profitMargin: 22.5,
          },
        };
      }
    }

    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();
    const now = date().toDate();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: projectId,
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(100000),
      totalSpent: new Decimal(20000),
      remainingBudget: new Decimal(80000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    sut = new GetCommercialStatsUseCase(
      new StatsWithCommercialData(),
      projectsRepository,
    );

    const result = await sut.execute({
      projectSlug: "projeto-alpha",
      userId: randomUUID(),
    });

    expect(result.cards.proposals.count).toBe(3);
    expect(result.cards.proposals.value).toContain("R$");
    expect(result.cards.proposals.wonValue).toContain("R$");
    expect(result.cards.contracts.count).toBe(2);
    expect(result.cards.contracts.value).toContain("R$");
    expect(result.cards.result.netValue).toContain("R$");
    expect(result.cards.result.profitMargin).toBe(22.5);
  });

  it("deve lançar ResourceNotFoundError quando projeto não existe", async () => {
    await expect(() =>
      sut.execute({
        projectSlug: "inexistente",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
