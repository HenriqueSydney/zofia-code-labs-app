import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../errors/ConflictError";
import { InMemoryExpenseCategoryRepository } from "../../repositories/in-memory/InMemoryExpenseCategoryRepository";
import { CreateExpenseCategoryUseCase } from "./CreateExpenseCategoryUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseCategoryRepository: InMemoryExpenseCategoryRepository;
let sut: CreateExpenseCategoryUseCase;

describe("CreateExpenseCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseCategoryRepository = new InMemoryExpenseCategoryRepository();
    sut = new CreateExpenseCategoryUseCase(expenseCategoryRepository);
  });

  it("deve criar categoria de despesa quando nome não existe", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await sut.execute({
      organizationId,
      userId,
      name: "Infraestrutura",
      description: "Despesas de infra",
    });

    expect(expenseCategoryRepository.items).toHaveLength(1);
    expect(expenseCategoryRepository.items[0].name).toBe("Infraestrutura");
    expect(expenseCategoryRepository.items[0].organizationId).toBe(organizationId);
  });

  it("não deve criar categoria de despesa com nome duplicado", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await expenseCategoryRepository.create({
      organizationId,
      name: "Infraestrutura",
    });

    await expect(() =>
      sut.execute({
        organizationId,
        userId,
        name: "Infraestrutura",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(expenseCategoryRepository.items).toHaveLength(1);
  });
});
