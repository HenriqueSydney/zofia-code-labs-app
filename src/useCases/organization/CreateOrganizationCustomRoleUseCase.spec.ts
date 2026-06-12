import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { CreateOrganizationCustomRoleUseCase } from "./CreateOrganizationCustomRoleUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: CreateOrganizationCustomRoleUseCase;

describe("CreateOrganizationCustomRoleUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new CreateOrganizationCustomRoleUseCase(organizationsRepository);
  });

  it("deve criar perfil customizado na organização", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const result = await sut.execute({
      userId,
      organizationId: organization.id,
      name: "Suporte",
      description: "Equipe de suporte",
      permissions: ["projects:read"],
    });

    expect(result.role.name).toBe("Suporte");
    expect(organizationsRepository.customRoles).toHaveLength(1);
  });

  it("não deve criar perfil em organização inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        organizationId: randomUUID(),
        name: "Suporte",
        permissions: ["projects:read"],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
