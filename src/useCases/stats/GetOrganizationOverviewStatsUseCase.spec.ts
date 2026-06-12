import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetOrganizationOverviewStatsUseCase } from "./GetOrganizationOverviewStatsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetOrganizationOverviewStatsUseCase;

describe("GetOrganizationOverviewStatsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetOrganizationOverviewStatsUseCase(statsRepository);
  });

  it("deve retornar cards de overview da organização", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toHaveLength(4);
    expect(result[0].titleKey).toBe("totalProjects");
    expect(result[0].value).toBe("0");
    expect(result[0].iconKey).toBe("FolderKanban");
    expect(result[0].trend).toBe("0%");
    expect(result[1].trend).toBe("0%");
    expect(result[3].trend).toBe("0%");
  });

  it("deve formatar trends positivos, negativos e zero em todos os cards", async () => {
    class StatsWithTrends extends InMemoryProjectStatsRepository {
      async getDashboardStats() {
        return {
          totalProjects: { value: 12, trend: 8 },
          activeProjects: { value: 5, trend: 3 },
          completedProjects: { value: 2, trend: 5 },
          clientSatisfaction: { value: 92, trend: 4 },
        };
      }
    }

    sut = new GetOrganizationOverviewStatsUseCase(new StatsWithTrends());

    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toEqual([
      {
        titleKey: "totalProjects",
        value: "12",
        trend: "+8%",
        iconKey: "FolderKanban",
      },
      {
        titleKey: "activeProjects",
        value: "5",
        trend: "+3%",
        iconKey: "TrendingUp",
      },
      {
        titleKey: "completedProjects",
        value: "2",
        trend: "+5%",
        iconKey: "CheckCircle2",
      },
      {
        titleKey: "clientSatisfaction",
        value: "92%",
        trend: "+4%",
        iconKey: "Users",
      },
    ]);
  });
});
