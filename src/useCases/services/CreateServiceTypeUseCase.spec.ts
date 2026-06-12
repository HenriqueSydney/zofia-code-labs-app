import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError, ConflictError } from "../../errors";
import { InMemoryServiceTypeRepository } from "../../repositories/in-memory/InMemoryServiceTypeRepository";
import { CreateServiceTypeUseCase } from "./CreateServiceTypeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let serviceTypeRepository: InMemoryServiceTypeRepository;
let sut: CreateServiceTypeUseCase;

describe("CreateServiceTypeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceTypeRepository = new InMemoryServiceTypeRepository();
    sut = new CreateServiceTypeUseCase(serviceTypeRepository);
  });

  it("deve criar tipo de serviço quando nome não existe", async () => {
    const organizationId = randomUUID();
    const categoryId = randomUUID();

    serviceTypeRepository.categories.push({
      id: categoryId,
      organizationId,
      name: "Dev",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await sut.execute({
      organizationId,
      userId: randomUUID(),
      categoryId,
      name: "Landing Page",
      basePrice: 5000,
    });

    expect(serviceTypeRepository.items).toHaveLength(1);
    expect(serviceTypeRepository.items[0].name).toBe("Landing Page");
  });

  it("não deve criar serviço com nome duplicado", async () => {
    const organizationId = randomUUID();
    const categoryId = randomUUID();
    const payload = {
      organizationId,
      userId: randomUUID(),
      categoryId,
      name: "Consultoria",
    };

    serviceTypeRepository.categories.push({
      id: categoryId,
      organizationId,
      name: "Dev",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await sut.execute(payload);

    await expect(() => sut.execute(payload)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it("não deve aceitar preço base negativo", async () => {
    const organizationId = randomUUID();
    const categoryId = randomUUID();

    serviceTypeRepository.categories.push({
      id: categoryId,
      organizationId,
      name: "Dev",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await expect(() =>
      sut.execute({
        organizationId,
        userId: randomUUID(),
        categoryId,
        name: "Serviço X",
        basePrice: -100,
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });
});
