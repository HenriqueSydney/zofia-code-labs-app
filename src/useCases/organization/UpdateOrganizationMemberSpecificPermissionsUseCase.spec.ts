import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { MemberRole, MemberStatus } from "../../generated/prisma/enums";
import { date } from "../../lib/dayjs";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { UpdateOrganizationMemberSpecificPermissionsUseCase } from "./UpdateOrganizationMemberSpecificPermissionsUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: UpdateOrganizationMemberSpecificPermissionsUseCase;

describe("UpdateOrganizationMemberSpecificPermissionsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new UpdateOrganizationMemberSpecificPermissionsUseCase(
      organizationsRepository,
    );
  });

  it("deve atualizar permissões específicas do membro", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const memberId = randomUUID();
    organizationsRepository.members.push({
      id: memberId,
      userId: randomUUID(),
      organizationId: organization.id,
      role: MemberRole.TENANT_MEMBER,
      customRoleId: null,
      specificPermissions: [],
      status: MemberStatus.ACTIVE,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      removedAt: null,
    });

    const result = await sut.execute({
      userId,
      memberId,
      organizationId: organization.id,
      permissions: ["projects:read", "clients:read"],
    });

    expect(result.member.specificPermissions).toEqual([
      "projects:read",
      "clients:read",
    ]);
  });

  it("não deve atualizar permissões em organização inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        memberId: randomUUID(),
        organizationId: randomUUID(),
        permissions: ["projects:read"],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
