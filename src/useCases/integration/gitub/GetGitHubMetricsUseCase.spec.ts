import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../../errors/IntegrationError";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import type { IGitService } from "../../../services/git/IGitService";
import type { IntegrationFactory } from "../../../services/IntegrationFactory";
import { GetGitHubMetricsUseCase } from "./GetGitHubMetricsUseCase";

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let integrationFactory: IntegrationFactory;
let gitService: IGitService;
let sut: GetGitHubMetricsUseCase;

describe("GetGitHubMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();

    gitService = {
      getRepoStats: vi.fn().mockResolvedValue({
        stars: 10,
        forks: 5,
        openIssues: 2,
        size: 100,
      }),
      getLatestWorkflowRuns: vi.fn().mockResolvedValue([
        { status: "success" },
        { status: "failure" },
      ]),
      getCommitStats: vi.fn().mockResolvedValue({
        stats: [{ count: 3 }, { count: 7 }],
      }),
      getPullRequestAnalysis: vi.fn().mockResolvedValue({
        mergedCount: 8,
        closedCount: 10,
        avgMergeTimeHours: 12.5,
        latestMergedPRs: [],
      }),
      getTopContributors: vi.fn().mockResolvedValue([
        { login: "dev1", contributions: 20 },
        { login: "bot[bot]", contributions: 5 },
      ]),
    } as unknown as IGitService;

    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue(gitService),
    } as unknown as IntegrationFactory;

    sut = new GetGitHubMetricsUseCase(
      projectIntegrationRepository,
      integrationFactory,
    );
  });

  it("deve retornar métricas do GitHub", async () => {
    const organizationId = randomUUID();
    const projectId = randomUUID();
    const integrationTypeId = randomUUID();
    const organizationIntegrationId = randomUUID();

    projectIntegrationRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
    });
    projectIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: IntegrationType.GITHUB,
      logo: null,
    });
    projectIntegrationRepository.organizationIntegrations.push({
      id: organizationIntegrationId,
      organizationId,
    });

    await projectIntegrationRepository.create({
      projectId,
      integrationTypeId,
      organizationIntegrationId,
      config: { full_name: "org/repo" },
      enabled: true,
    });

    const result = await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
    });

    expect(result.metrics.repoStats.stars).toBe(10);
    expect(result.metrics.activity.totalCommitsLast30Days).toBe(10);
    expect(result.metrics.repoStats.totalContributors).toBe(1);
    expect(result.metrics.pipeline.successRate).toBe(50);
  });

  it("deve retornar successRate -1 quando não houver runs de pipeline", async () => {
    vi.mocked(gitService.getLatestWorkflowRuns).mockResolvedValueOnce([]);

    const organizationId = randomUUID();
    const projectId = randomUUID();
    const integrationTypeId = randomUUID();
    const organizationIntegrationId = randomUUID();

    projectIntegrationRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
    });
    projectIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: IntegrationType.GITHUB,
      logo: null,
    });
    projectIntegrationRepository.organizationIntegrations.push({
      id: organizationIntegrationId,
      organizationId,
    });

    await projectIntegrationRepository.create({
      projectId,
      integrationTypeId,
      organizationIntegrationId,
      config: { full_name: "org/repo" },
      enabled: true,
    });

    const result = await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
    });

    expect(result.metrics.pipeline.successRate).toBe(-1);
  });

  it("deve lançar IntegrationError quando integração não está configurada", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});
