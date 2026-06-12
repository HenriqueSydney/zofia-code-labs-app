import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import { ORG_INVITE_IDENTIFIER_PREFIX } from "@/constants/orgInvite";
import { ValidationError } from "@/errors";
import { MemberRole, MemberStatus, Role } from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs";
import { InMemoryOrganizationsRepository } from "@/repositories/in-memory/InMemoryOrganizationsRepository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryVerificationTokenRepository } from "@/repositories/in-memory/InMemoryVerificationTokenRepository";
import { AcceptOrganizationInviteUseCase } from "./AcceptOrganizationInviteUseCase";

let organizationsRepository: InMemoryOrganizationsRepository;
let usersRepository: InMemoryUsersRepository;
let verificationTokenRepository: InMemoryVerificationTokenRepository;
let sut: AcceptOrganizationInviteUseCase;

describe("AcceptOrganizationInviteUseCase", () => {
  beforeEach(() => {
    organizationsRepository = new InMemoryOrganizationsRepository();
    usersRepository = new InMemoryUsersRepository();
    verificationTokenRepository = new InMemoryVerificationTokenRepository();
    sut = new AcceptOrganizationInviteUseCase(
      verificationTokenRepository,
      usersRepository,
      organizationsRepository,
    );
  });

  it("deve validar token pendente sem consumir o convite", async () => {
    const organization = await organizationsRepository.create({
      name: "Org Test",
      slug: "org-test",
    });
    const user = await usersRepository.create({
      email: "convidado@test.com",
      name: "Convidado",
      organizationId: organization.id,
      role: Role.USER,
      passwordHash: "hash",
    });

    await organizationsRepository.createMember({
      userId: user.id,
      organizationId: organization.id,
      role: MemberRole.TENANT_MEMBER,
      status: MemberStatus.PENDING,
    });

    const token = "invite-token-123";
    const identifier = `${ORG_INVITE_IDENTIFIER_PREFIX}${organization.id}:convidado@test.com`;

    await verificationTokenRepository.replaceToken(
      identifier,
      token,
      date().add(1, "hour").toDate(),
    );

    const result = await sut.execute({ token });

    expect(result).toEqual({
      userId: user.id,
      organizationId: organization.id,
      email: "convidado@test.com",
      token,
    });

    const persistedToken =
      await verificationTokenRepository.findByToken(token);
    expect(persistedToken).not.toBeNull();

    const member = await organizationsRepository.findMemberByUserIdAndOrganizationId(
      user.id,
      organization.id,
    );
    expect(member?.status).toBe(MemberStatus.PENDING);
  });

  it("deve rejeitar token expirado", async () => {
    const token = "expired-token";
    await verificationTokenRepository.replaceToken(
      `${ORG_INVITE_IDENTIFIER_PREFIX}${randomUUID()}:user@test.com`,
      token,
      date().subtract(1, "hour").toDate(),
    );

    await expect(sut.execute({ token })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("deve rejeitar convite já aceito", async () => {
    const organization = await organizationsRepository.create({
      name: "Org Test",
      slug: "org-test-2",
    });
    const user = await usersRepository.create({
      email: "ativo@test.com",
      name: "Ativo",
      organizationId: organization.id,
      role: Role.USER,
      passwordHash: "hash",
    });

    await organizationsRepository.createMember({
      userId: user.id,
      organizationId: organization.id,
      role: MemberRole.TENANT_MEMBER,
      status: MemberStatus.ACTIVE,
    });

    const token = "active-member-token";
    await verificationTokenRepository.replaceToken(
      `${ORG_INVITE_IDENTIFIER_PREFIX}${organization.id}:ativo@test.com`,
      token,
      date().add(1, "hour").toDate(),
    );

    await expect(sut.execute({ token })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
