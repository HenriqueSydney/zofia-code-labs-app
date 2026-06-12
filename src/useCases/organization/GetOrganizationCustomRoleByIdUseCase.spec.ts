import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { GetOrganizationCustomRoleByIdUseCase } from "./GetOrganizationCustomRoleByIdUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: GetOrganizationCustomRoleByIdUseCase;

describe("GetOrganizationCustomRoleByIdUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new GetOrganizationCustomRoleByIdUseCase(organizationsRepository);
  });

  it("deve retornar perfil customizado por id", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const role = await organizationsRepository.createCustomRole({
      organizationId: organization.id,
      name: "Comercial",
      permissions: ["clients:read"],
    });

    const result = await sut.execute({
      userId,
      customRoleId: role.id,
    });

    expect(result.customRole.id).toBe(role.id);
    expect(result.customRole.name).toBe("Comercial");
  });

  it("não deve retornar perfil inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        customRoleId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
