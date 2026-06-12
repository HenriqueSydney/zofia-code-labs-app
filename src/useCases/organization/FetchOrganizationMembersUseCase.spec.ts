import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { MemberRole, MemberStatus } from "../../generated/prisma/enums";
import { date } from "../../lib/dayjs";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { FetchOrganizationMembersUseCase } from "./FetchOrganizationMembersUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let sut: FetchOrganizationMembersUseCase;

describe("FetchOrganizationMembersUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new FetchOrganizationMembersUseCase(organizationsRepository);
  });

  it("deve listar membros da organização", async () => {
    const userId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const memberUserId = randomUUID();
    organizationsRepository.users.push({
      id: memberUserId,
      name: "Ana Silva",
      email: "ana@zofia.com",
      emailVerified: null,
      image: null,
    });

    organizationsRepository.members.push({
      id: randomUUID(),
      userId: memberUserId,
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
      organizationId: organization.id,
      userId,
    });

    expect(result.members).toHaveLength(1);
    expect(result.members[0].name).toBe("Ana Silva");
  });

  it("não deve listar membros de organização inexistente", async () => {
    await expect(() =>
      sut.execute({
        organizationId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
