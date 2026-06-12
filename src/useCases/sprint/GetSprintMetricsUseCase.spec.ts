import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { date } from "../../lib/dayjs";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetSprintMetricsUseCase } from "./GetSprintMetricsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: GetSprintMetricsUseCase;

describe("GetSprintMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetSprintMetricsUseCase(statsRepository, projectsRepository);
  });

  it("deve retornar métricas de sprint do projeto", async () => {
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

    expect(result.burndown).toEqual([]);
    expect(result.history).toEqual([]);
  });

  it("deve lançar ResourceNotFoundError quando projeto não existe", async () => {
    await expect(() =>
      sut.execute({
        projectSlug: "inexistente",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve mapear histórico de sprints quando houver dados", async () => {
    class StatsWithSprints extends InMemoryProjectStatsRepository {
      async getSprintMetrics() {
        return {
          currentSprintBurndown: [{ day: 1, remaining: 10 }],
          sprintHistory: [
            { name: "Sprint 1", planned: 20, completed: 18 },
          ],
        };
      }
    }

    sut = new GetSprintMetricsUseCase(
      new StatsWithSprints(),
      projectsRepository,
    );

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

    expect(result.burndown).toHaveLength(1);
    expect(result.history[0]).toEqual({
      name: "Sprint 1",
      planned: 20,
      completed: 18,
    });
  });
});
