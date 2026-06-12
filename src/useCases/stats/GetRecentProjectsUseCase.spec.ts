import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetRecentProjectsUseCase } from "./GetRecentProjectsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetRecentProjectsUseCase;

describe("GetRecentProjectsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetRecentProjectsUseCase(statsRepository);
  });

  it("deve retornar lista vazia quando não há projetos recentes", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toEqual([]);
  });

  it("deve formatar projetos recentes para a tabela", async () => {
    const organizationId = randomUUID();
    const projectDate = new Date("2024-03-15T10:00:00.000Z");

    vi.spyOn(statsRepository, "getRecentProjects").mockResolvedValue([
      {
        id: randomUUID(),
        name: "Projeto Beta",
        clientName: "Cliente X",
        clientLogo: null,
        status: "IN_PROGRESS",
        health: "ON_TRACK",
        date: projectDate,
        endDate: null,
        budget: 25000,
      },
    ]);

    const result = await sut.execute({
      organizationId,
      userId: randomUUID(),
    });

    expect(result[0].name.value).toBe("Projeto Beta");
    expect(result[0].client.value).toBe("Cliente X");
    expect(result[0].status.value).toBe("IN_PROGRESS");
    expect(result[0].status.health).toBe("ON_TRACK");
    expect(result[0].budget.value).toContain("R$");
    expect(result[0].date.value).toBe("15/03/2024");
    expect(result[0].date.original).toEqual(projectDate);
  });
});
