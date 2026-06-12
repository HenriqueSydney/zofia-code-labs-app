import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { InMemoryExpenseCategoryRepository } from "../../repositories/in-memory/InMemoryExpenseCategoryRepository";
import { DeleteExpenseCategoryUseCase } from "./DeleteExpenseCategoryUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseCategoryRepository: InMemoryExpenseCategoryRepository;
let sut: DeleteExpenseCategoryUseCase;

describe("DeleteExpenseCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseCategoryRepository = new InMemoryExpenseCategoryRepository();
    sut = new DeleteExpenseCategoryUseCase(expenseCategoryRepository);
  });

  it("deve remover categoria de despesa existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const category = await expenseCategoryRepository.create({
      organizationId,
      name: "Infraestrutura",
    });

    await sut.execute({
      id: category.id,
      organizationId,
      userId,
    });

    expect(expenseCategoryRepository.items[0].deletedAt).not.toBeNull();
  });

  it("não deve remover categoria inexistente ou de outra organização", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await expect(() =>
      sut.execute({
        id: randomUUID(),
        organizationId,
        userId,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
