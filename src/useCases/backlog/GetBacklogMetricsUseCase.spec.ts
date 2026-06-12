import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { GetBacklogMetricsUseCase } from "./GetBacklogMetricsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: GetBacklogMetricsUseCase;

describe("GetBacklogMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetBacklogMetricsUseCase(statsRepository, projectsRepository);
  });

  it("deve retornar métricas do backlog quando projeto existe", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    await projectsRepository.create({
      name: "Projeto ERP",
      description: "Descrição",
      slug: "projeto-erp",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const result = await sut.execute({
      projectSlug: "projeto-erp",
      userId,
    });

    expect(result.cards.totalTasks).toBe("0");
    expect(result.cards.completedTasks).toBe("0");
    expect(result.cards.progress).toBe("0%");
    expect(result.chartData).toEqual([]);
  });

  it("não deve retornar métricas quando projeto não existe", async () => {
    await expect(() =>
      sut.execute({
        projectSlug: "inexistente",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve calcular progresso e mapear distribuição por status", async () => {
    class StatsWithBacklog extends InMemoryProjectStatsRepository {
      async getBacklogMetrics() {
        return {
          totalTasks: 10,
          completedTasks: 4,
          statusDistribution: [
            { status: "TODO", count: 6 },
            { status: "DONE", count: 4 },
          ],
          trends: { tasks: 2, completed: 1 },
        };
      }
    }

    sut = new GetBacklogMetricsUseCase(
      new StatsWithBacklog(),
      projectsRepository,
    );

    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    await projectsRepository.create({
      name: "Projeto ERP",
      description: "Descrição",
      slug: "projeto-erp",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const result = await sut.execute({
      projectSlug: "projeto-erp",
      userId,
    });

    expect(result.cards.totalTasks).toBe("10");
    expect(result.cards.completedTasks).toBe("4");
    expect(result.cards.progress).toBe("40%");
    expect(result.chartData).toEqual([
      { name: "todo", value: 6 },
      { name: "done", value: 4 },
    ]);
    expect(result.cards.trends).toEqual({ tasks: 2, completed: 1 });
  });

  it("deve manter progresso em 0% quando não há tarefas", async () => {
    class StatsEmptyBacklog extends InMemoryProjectStatsRepository {
      async getBacklogMetrics() {
        return {
          totalTasks: 0,
          completedTasks: 0,
          statusDistribution: [],
          trends: { tasks: 0, completed: 0 },
        };
      }
    }

    sut = new GetBacklogMetricsUseCase(
      new StatsEmptyBacklog(),
      projectsRepository,
    );

    const organizationId = randomUUID();
    const clientId = randomUUID();

    await projectsRepository.create({
      name: "Projeto vazio",
      description: "Sem tarefas",
      slug: "projeto-vazio",
      clientId,
      createdBy: randomUUID(),
      organizationId,
    });

    const result = await sut.execute({
      projectSlug: "projeto-vazio",
      userId: randomUUID(),
    });

    expect(result.cards.progress).toBe("0%");
  });
});
