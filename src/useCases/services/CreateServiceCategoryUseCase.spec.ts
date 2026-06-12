import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../errors/ConflictError";
import { InMemoryServiceCategoryRepository } from "../../repositories/in-memory/InMemoryServiceCategoryRepository";
import { CreateServiceCategoryUseCase } from "./CreateServiceCategoryUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceCategoryRepository: InMemoryServiceCategoryRepository;
let sut: CreateServiceCategoryUseCase;

describe("CreateServiceCategoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceCategoryRepository = new InMemoryServiceCategoryRepository();
    sut = new CreateServiceCategoryUseCase(serviceCategoryRepository);
  });

  it("deve criar categoria de serviço quando nome não existe", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await sut.execute({
      organizationId,
      userId,
      name: "Desenvolvimento",
      description: "Serviços de software",
      taxCode: "01.01",
    });

    expect(serviceCategoryRepository.items).toHaveLength(1);
    expect(serviceCategoryRepository.items[0].name).toBe("Desenvolvimento");
    expect(serviceCategoryRepository.items[0].taxCode).toBe("01.01");
  });

  it("não deve criar categoria de serviço com nome duplicado", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await serviceCategoryRepository.create({
      organizationId,
      name: "Desenvolvimento",
    });

    await expect(() =>
      sut.execute({
        organizationId,
        userId,
        name: "Desenvolvimento",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(serviceCategoryRepository.items).toHaveLength(1);
  });
});
