import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetBacklogEvolutionUseCase } from "./GetBacklogEvolutionUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetBacklogEvolutionUseCase;

describe("GetBacklogEvolutionUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetBacklogEvolutionUseCase(statsRepository);
  });

  it("deve retornar evolução do backlog dos últimos 6 meses", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toHaveLength(6);
    expect(result[0]).toHaveProperty("month");
    expect(result[0]).toHaveProperty("created");
    expect(result[0]).toHaveProperty("completed");
  });
});
