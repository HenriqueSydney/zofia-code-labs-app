import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendUserJoinedNotification } from "@/email/send/sendUserJoinedNotification";
import { MemberRole, MemberStatus, Role } from "../../generated/prisma/enums";
import { date } from "../../lib/dayjs";
import { InMemoryOrganizationsRepository } from "../../repositories/in-memory/InMemoryOrganizationsRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ActivateOrganizationMemberUseCase } from "../organization/ActivateOrganizationMemberUseCase";
import { ActivatePendingMembersOnLoginUseCase } from "./ActivatePendingMembersOnLoginUseCase";

vi.mock("@/email/send/sendUserJoinedNotification", () => ({
  sendUserJoinedNotification: vi.fn(),
}));

let organizationsRepository: InMemoryOrganizationsRepository;
let usersRepository: InMemoryUsersRepository;
let sut: ActivatePendingMembersOnLoginUseCase;

describe("ActivatePendingMembersOnLoginUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationsRepository = new InMemoryOrganizationsRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new ActivatePendingMembersOnLoginUseCase(
      organizationsRepository,
      new ActivateOrganizationMemberUseCase(
        organizationsRepository,
        usersRepository,
      ),
    );
  });

  it("deve ativar membros pendentes e notificar administradores", async () => {
    const organization = await organizationsRepository.create({
      name: "Zofia Labs",
      slug: "zofia-labs",
    });

    const adminUser = await usersRepository.create({
      organizationId: organization.id,
      name: "Admin",
      email: "admin@zofia.com",
      role: Role.USER,
      passwordHash: "hash",
    });

    const newUser = await usersRepository.create({
      organizationId: organization.id,
      name: "Novo Membro",
      email: "novo@zofia.com",
      role: Role.USER,
      passwordHash: "hash",
    });

    organizationsRepository.users.push(
      {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email!,
        emailVerified: null,
        image: null,
      },
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email!,
        emailVerified: null,
        image: null,
      },
    );

    organizationsRepository.members.push(
      {
        id: randomUUID(),
        userId: adminUser.id,
        organizationId: organization.id,
        role: MemberRole.TENANT_ADMIN,
        customRoleId: null,
        specificPermissions: [],
        status: MemberStatus.ACTIVE,
        createdAt: date().toDate(),
        updatedAt: date().toDate(),
        removedAt: null,
      },
      {
        id: randomUUID(),
        userId: newUser.id,
        organizationId: organization.id,
        role: MemberRole.TENANT_MEMBER,
        customRoleId: null,
        specificPermissions: [],
        status: MemberStatus.PENDING,
        createdAt: date().toDate(),
        updatedAt: date().toDate(),
        removedAt: null,
      },
    );

    await sut.execute({ userId: newUser.id });

    expect(
      organizationsRepository.members.find((m) => m.userId === newUser.id)?.status,
    ).toBe(MemberStatus.ACTIVE);
    expect(sendUserJoinedNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@zofia.com",
        newUserName: "Novo Membro",
        newUserEmail: "novo@zofia.com",
        teamName: "Zofia Labs",
      }),
    );
  });

  it("não deve notificar quando não há membros pendentes", async () => {
    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário",
      email: "user@zofia.com",
      role: Role.USER,
      passwordHash: "hash",
    });

    await sut.execute({ userId: user.id });

    expect(sendUserJoinedNotification).not.toHaveBeenCalled();
  });
});
