import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { MemberRole, MemberStatus } from "../../generated/prisma/enums";
import { date } from "../../lib/dayjs";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { UpdateOrganizationUserRoleUseCase } from "./UpdateOrganizationUserRoleUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: UpdateOrganizationUserRoleUseCase;

describe("UpdateOrganizationUserRoleUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new UpdateOrganizationUserRoleUseCase(organizationsRepository);
  });

  it("deve atualizar membro para role estática admin", async () => {
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
      roleId: "admin",
    });

    expect(result.role).toBe("TENANT_ADMIN");
    expect(organizationsRepository.members[0].role).toBe(MemberRole.TENANT_ADMIN);
  });

  it("deve atualizar membro para perfil customizado", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const role = await organizationsRepository.createCustomRole({
      organizationId: organization.id,
      name: "Financeiro",
      permissions: ["financial:read"],
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
      roleId: role.id,
    });

    expect(result.role).toBe("Financeiro");
    expect(organizationsRepository.members[0].customRoleId).toBe(role.id);
  });

  it("não deve atualizar membro inexistente", async () => {
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        memberId: randomUUID(),
        organizationId: organization.id,
        roleId: "admin",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve vincular perfil customizado de outra organização", async () => {
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
      name: "Financeiro",
      permissions: ["financial:read"],
    });

    const memberId = randomUUID();
    organizationsRepository.members.push({
      id: memberId,
      userId: randomUUID(),
      organizationId: orgB.id,
      role: MemberRole.TENANT_MEMBER,
      customRoleId: null,
      specificPermissions: [],
      status: MemberStatus.ACTIVE,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      removedAt: null,
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        memberId,
        organizationId: orgB.id,
        roleId: role.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("deve lançar ResourceNotFoundError quando membro não existe", async () => {
    const org = await organizationsRepository.create({
      name: "Org A",
      slug: "org-a",
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        memberId: randomUUID(),
        organizationId: org.id,
        roleId: "admin",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar ResourceNotFoundError quando perfil customizado não existe", async () => {
    const org = await organizationsRepository.create({
      name: "Org A",
      slug: "org-a",
    });
    const memberId = randomUUID();
    organizationsRepository.members.push({
      id: memberId,
      userId: randomUUID(),
      organizationId: org.id,
      role: "TENANT_MEMBER" as never,
      customRoleId: null,
      specificPermissions: [],
      status: MemberStatus.ACTIVE,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      removedAt: null,
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        memberId,
        organizationId: org.id,
        roleId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
