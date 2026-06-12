import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetPendingSettlementsUseCase } from "./GetPendingSettlementsUseCase";

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetPendingSettlementsUseCase;

describe("GetPendingSettlementsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetPendingSettlementsUseCase(statsRepository);
  });

  it("deve retornar lista vazia quando não há pendências", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toEqual([]);
  });
});
