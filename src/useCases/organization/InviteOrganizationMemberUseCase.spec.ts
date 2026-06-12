import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendInviteUserEmail } from "@/email/send/sendInviteUserEmail";
import { ConflictError } from "../../errors/ConflictError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { MemberRole, MemberStatus, Role } from "../../generated/prisma/enums";
import { date } from "../../lib/dayjs";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { InMemoryVerificationTokenRepository } from "../../repositories/in-memory/InMemoryVerificationTokenRepository";
import { InviteOrganizationMemberUseCase } from "./InviteOrganizationMemberUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/email/send/sendInviteUserEmail", () => ({
  sendInviteUserEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: unknown) => Promise<void>) =>
      callback({}),
    ),
  },
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let usersRepository: InMemoryUsersRepository;
let verificationTokenRepository: InMemoryVerificationTokenRepository;
let sut: InviteOrganizationMemberUseCase;

describe("InviteOrganizationMemberUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    usersRepository = new InMemoryUsersRepository();
    verificationTokenRepository = new InMemoryVerificationTokenRepository();
    sut = new InviteOrganizationMemberUseCase(
      organizationsRepository,
      usersRepository,
      verificationTokenRepository,
    );
  });

  it("deve criar usuário inexistente, membro pendente e enviar e-mail", async () => {
    const inviterUserId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    await usersRepository.create({
      organizationId: organization.id,
      name: "Admin",
      email: "admin@zofia.com",
      role: Role.USER,
      passwordHash: "hash",
    });

    await sut.execute({
      inviterUserId,
      organizationId: organization.id,
      name: "Novo Membro",
      email: "novo@zofia.com",
      roleId: "admin",
    });

    expect(usersRepository.items).toHaveLength(2);
    expect(organizationsRepository.members).toHaveLength(1);
    expect(organizationsRepository.members[0].status).toBe(MemberStatus.PENDING);
    expect(organizationsRepository.members[0].role).toBe(
      MemberRole.TENANT_ADMIN,
    );
    expect(verificationTokenRepository.items).toHaveLength(1);
    expect(sendInviteUserEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "novo@zofia.com",
        organizationName: "Zofia Labs",
        userEmail: "novo@zofia.com",
        role: "Administrador",
        inviteLink: expect.stringContaining("/auth/invite/accept?token="),
      }),
    );
  });

  it("deve reenviar convite para membro pendente existente", async () => {
    const inviterUserId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const existingUser = await usersRepository.create({
      organizationId: organization.id,
      name: "Membro Pendente",
      email: "membro@zofia.com",
      role: Role.USER,
      passwordHash: "hash",
    });

    organizationsRepository.members.push({
      id: randomUUID(),
      userId: existingUser.id,
      organizationId: organization.id,
      role: MemberRole.TENANT_MEMBER,
      customRoleId: null,
      specificPermissions: [],
      status: MemberStatus.PENDING,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      removedAt: null,
    });

    await sut.execute({
      inviterUserId,
      organizationId: organization.id,
      name: "Membro Pendente",
      email: "membro@zofia.com",
      roleId: "admin",
    });

    expect(organizationsRepository.members).toHaveLength(1);
    expect(organizationsRepository.members[0].status).toBe(MemberStatus.PENDING);
    expect(organizationsRepository.members[0].role).toBe(
      MemberRole.TENANT_ADMIN,
    );
    expect(sendInviteUserEmail).toHaveBeenCalled();
  });

  it("deve lançar ConflictError quando usuário já é membro ativo", async () => {
    const inviterUserId = randomUUID();
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const existingUser = await usersRepository.create({
      organizationId: organization.id,
      name: "Membro Existente",
      email: "membro@zofia.com",
      role: Role.USER,
      passwordHash: "hash",
    });

    organizationsRepository.members.push({
      id: randomUUID(),
      userId: existingUser.id,
      organizationId: organization.id,
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
        inviterUserId,
        organizationId: organization.id,
        name: "Membro Existente",
        email: "membro@zofia.com",
        roleId: "member",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(sendInviteUserEmail).not.toHaveBeenCalled();
  });

  it("deve lançar ResourceNotFoundError quando organização não existe", async () => {
    await expect(() =>
      sut.execute({
        inviterUserId: randomUUID(),
        organizationId: randomUUID(),
        name: "Novo Membro",
        email: "novo@zofia.com",
        roleId: "member",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
