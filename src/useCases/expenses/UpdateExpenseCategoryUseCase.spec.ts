import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { InMemoryExpenseCategoryRepository } from "../../repositories/in-memory/InMemoryExpenseCategoryRepository";
import { UpdateExpenseCategoryUseCase } from "./UpdateExpenseCategoryUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseCategoryRepository: InMemoryExpenseCategoryRepository;
let sut: UpdateExpenseCategoryUseCase;

describe("UpdateExpenseCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseCategoryRepository = new InMemoryExpenseCategoryRepository();
    sut = new UpdateExpenseCategoryUseCase(expenseCategoryRepository);
  });

  it("deve atualizar categoria de despesa existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const category = await expenseCategoryRepository.create({
      organizationId,
      name: "Infra",
    });

    await sut.execute({
      id: category.id,
      organizationId,
      userId,
      data: { name: "Infraestrutura", description: "Cloud e servidores" },
    });

    expect(expenseCategoryRepository.items[0].name).toBe("Infraestrutura");
    expect(expenseCategoryRepository.items[0].description).toBe(
      "Cloud e servidores",
    );
  });

  it("não deve atualizar categoria inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        organizationId: randomUUID(),
        userId: randomUUID(),
        data: { name: "X" },
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
