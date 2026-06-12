import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { FetchOrganizationCustomRolesUseCase } from "./FetchOrganizationCustomRolesUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: FetchOrganizationCustomRolesUseCase;

describe("FetchOrganizationCustomRolesUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new FetchOrganizationCustomRolesUseCase(organizationsRepository);
  });

  it("deve listar perfis customizados da organização", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    await organizationsRepository.createCustomRole({
      organizationId: organization.id,
      name: "Financeiro",
      permissions: ["financial:read"],
    });

    const result = await sut.execute({
      organizationId: organization.id,
      userId,
    });

    expect(result.roles).toHaveLength(1);
    expect(result.roles[0].name).toBe("Financeiro");
  });

  it("não deve listar perfis de organização inexistente", async () => {
    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
