import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryServiceCategoryRepository } from "../../repositories/in-memory/InMemoryServiceCategoryRepository";
import { DeleteServiceCategoryUseCase } from "./DeleteServiceCategoryUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceCategoryRepository: InMemoryServiceCategoryRepository;
let sut: DeleteServiceCategoryUseCase;

describe("DeleteServiceCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceCategoryRepository = new InMemoryServiceCategoryRepository();
    sut = new DeleteServiceCategoryUseCase(serviceCategoryRepository);
  });

  it("deve remover categoria de serviço existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const category = await serviceCategoryRepository.create({
      organizationId,
      name: "Consultoria",
    });

    await sut.execute({ id: category.id, organizationId, userId });

    expect(serviceCategoryRepository.items[0].deletedAt).not.toBeNull();
  });

  it("não deve remover categoria inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
