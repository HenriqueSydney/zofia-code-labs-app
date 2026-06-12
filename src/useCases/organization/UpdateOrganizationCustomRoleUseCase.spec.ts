import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { UpdateOrganizationCustomRoleUseCase } from "./UpdateOrganizationCustomRoleUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: UpdateOrganizationCustomRoleUseCase;

describe("UpdateOrganizationCustomRoleUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new UpdateOrganizationCustomRoleUseCase(organizationsRepository);
  });

  it("deve atualizar perfil customizado da organização", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const role = await organizationsRepository.createCustomRole({
      organizationId: organization.id,
      name: "Suporte",
      permissions: ["projects:read"],
    });

    const result = await sut.execute({
      userId,
      roleId: role.id,
      organizationId: organization.id,
      name: "Suporte N2",
      permissions: ["projects:read", "projects:update"],
    });

    expect(result.role.name).toBe("Suporte N2");
    expect(result.role.permissions).toContain("projects:update");
  });

  it("não deve atualizar perfil inexistente", async () => {
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        roleId: randomUUID(),
        organizationId: organization.id,
        name: "X",
        permissions: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve atualizar perfil de outra organização", async () => {
    const orgA = await organizationsRepository.create({
      name: "Org A",
      slug: "org-a",
    });
    const orgB = await organizationsRepository.create({
      name: "Org B",
      slug: "org-b",
    });

    const role = await organizationsRepository.createCustomRole({
      organizationId: orgA.id,
      name: "Suporte",
      permissions: ["projects:read"],
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        roleId: role.id,
        organizationId: orgB.id,
        name: "Suporte",
        permissions: [],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("deve lançar ResourceNotFoundError quando organização não existe", async () => {
    const org = await organizationsRepository.create({
      name: "Org A",
      slug: "org-a",
    });
    const role = await organizationsRepository.createCustomRole({
      organizationId: org.id,
      name: "Suporte",
      permissions: ["projects:read"],
    });

    organizationsRepository.organizations = organizationsRepository.organizations.filter(
      (item) => item.id !== org.id,
    );

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        roleId: role.id,
        organizationId: org.id,
        name: "Suporte",
        permissions: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
