import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryProjectStatsRepository } from "../../repositories/in-memory/InMemoryProjectStatsRepository";
import { GetExpensesByCategoryUseCase } from "./GetExpensesByCategoryUseCase";

let statsRepository: InMemoryProjectStatsRepository;
let sut: GetExpensesByCategoryUseCase;

describe("GetExpensesByCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsRepository = new InMemoryProjectStatsRepository();
    sut = new GetExpensesByCategoryUseCase(statsRepository);
  });

  it("deve retornar lista vazia quando não há despesas por categoria", async () => {
    const result = await sut.execute({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });

    expect(result).toEqual([]);
  });
});
