import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { DeleteOrganizationCustomRoleUseCase } from "./DeleteOrganizationCustomRoleUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: DeleteOrganizationCustomRoleUseCase;

describe("DeleteOrganizationCustomRoleUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new DeleteOrganizationCustomRoleUseCase(organizationsRepository);
  });

  it("deve excluir perfil customizado sem usuários vinculados", async () => {
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

    await sut.execute({ roleId: role.id, userId });

    expect(organizationsRepository.customRoles).toHaveLength(0);
  });

  it("não deve excluir perfil inexistente", async () => {
    await expect(() =>
      sut.execute({
        roleId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve excluir perfil com usuários vinculados", async () => {
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

    vi.spyOn(organizationsRepository, "deleteCustomRole").mockRejectedValueOnce(
      new Error("FK constraint"),
    );

    await expect(() =>
      sut.execute({ roleId: role.id, userId }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });
});
