import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/email/send/sendUserJoinedNotification", () => ({
  sendUserJoinedNotification: vi.fn(),
}));

import { ORG_INVITE_IDENTIFIER_PREFIX } from "@/constants/orgInvite";
import { ValidationError } from "@/errors";
import { MemberRole, MemberStatus, Role } from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs";
import { InMemoryOrganizationsRepository } from "@/repositories/in-memory/InMemoryOrganizationsRepository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryVerificationTokenRepository } from "@/repositories/in-memory/InMemoryVerificationTokenRepository";
import { ActivateOrganizationMemberUseCase } from "./ActivateOrganizationMemberUseCase";
import { CompleteOrganizationInviteLoginUseCase } from "./CompleteOrganizationInviteLoginUseCase";

let organizationsRepository: InMemoryOrganizationsRepository;
let usersRepository: InMemoryUsersRepository;
let verificationTokenRepository: InMemoryVerificationTokenRepository;
let sut: CompleteOrganizationInviteLoginUseCase;

describe("CompleteOrganizationInviteLoginUseCase", () => {
  beforeEach(() => {
    organizationsRepository = new InMemoryOrganizationsRepository();
    usersRepository = new InMemoryUsersRepository();
    verificationTokenRepository = new InMemoryVerificationTokenRepository();
    sut = new CompleteOrganizationInviteLoginUseCase(
      verificationTokenRepository,
      usersRepository,
      organizationsRepository,
      new ActivateOrganizationMemberUseCase(
        organizationsRepository,
        usersRepository,
      ),
    );
  });

  it("deve consumir token, ativar membro e retornar usuário autenticável", async () => {
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

    const result = await sut.execute({
      userId: user.id,
      inviteToken: token,
    });

    expect(result.id).toBe(user.id);
    expect(result.email).toBe("convidado@test.com");

    const deletedToken =
      await verificationTokenRepository.findByToken(token);
    expect(deletedToken).toBeNull();

    const member = await organizationsRepository.findMemberByUserIdAndOrganizationId(
      user.id,
      organization.id,
    );
    expect(member?.status).toBe(MemberStatus.ACTIVE);
  });

  it("deve rejeitar quando userId não corresponde ao token", async () => {
    const organization = await organizationsRepository.create({
      name: "Org Test",
      slug: "org-test-2",
    });
    const user = await usersRepository.create({
      email: "convidado@test.com",
      name: "Convidado",
      organizationId: organization.id,
      role: Role.USER,
      passwordHash: "hash",
    });

    const token = "invite-token-456";
    await verificationTokenRepository.replaceToken(
      `${ORG_INVITE_IDENTIFIER_PREFIX}${organization.id}:convidado@test.com`,
      token,
      date().add(1, "hour").toDate(),
    );

    await expect(
      sut.execute({
        userId: "outro-user-id",
        inviteToken: token,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
