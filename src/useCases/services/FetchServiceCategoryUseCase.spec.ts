import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryServiceCategoryRepository } from "../../repositories/in-memory/InMemoryServiceCategoryRepository";
import { FetchServiceCategoryUseCase } from "./FetchServiceCategoryUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceCategoryRepository: InMemoryServiceCategoryRepository;
let sut: FetchServiceCategoryUseCase;

describe("FetchServiceCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceCategoryRepository = new InMemoryServiceCategoryRepository();
    sut = new FetchServiceCategoryUseCase(serviceCategoryRepository);
  });

  it("deve listar categorias de serviço da organização", async () => {
    const organizationId = randomUUID();

    await serviceCategoryRepository.create({
      organizationId,
      name: "Design",
    });

    const { serviceCategories } = await sut.execute({
      organizationId,
      userId: randomUUID(),
    });

    expect(serviceCategories).toHaveLength(1);
    expect(serviceCategories[0].name).toBe("Design");
  });
});
