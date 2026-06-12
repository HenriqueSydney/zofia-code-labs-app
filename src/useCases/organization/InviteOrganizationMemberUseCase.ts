import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";

import {
  ConflictError,
  ForbiddenError,
  ResourceNotFoundError,
} from "@/errors";
import { sendInviteUserEmail } from "@/email/send/sendInviteUserEmail";
import { MemberRole, MemberStatus, Role } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { toOrganizationAsset } from "@/lib/auth/toOrganizationAsset";
import { date } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { IVerificationTokenRepository } from "@/repositories/IVerificationTokenRepository";
import { ORG_INVITE_IDENTIFIER_PREFIX } from "@/constants/orgInvite";
const ORG_INVITE_TOKEN_TTL_HOURS = 24;

const STATIC_ROLES_MAP: Record<string, MemberRole> = {
  admin: MemberRole.TENANT_ADMIN,
  member: MemberRole.TENANT_MEMBER,
  viewer: MemberRole.TENANT_OBSERVER,
};

const STATIC_ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  member: "Membro",
  viewer: "Visualizador",
};

type ResolvedMemberAssignment = {
  role: MemberRole;
  customRoleId: string | null;
  roleLabel: string;
};

interface InviteOrganizationMemberUseCaseRequest {
  inviterUserId: string;
  organizationId: string;
  name: string;
  email: string;
  roleId: string;
}

export class InviteOrganizationMemberUseCase {
  constructor(
    private organizationsRepository: IOrganizationsRepository,
    private usersRepository: IUserRepository,
    private verificationTokenRepository: IVerificationTokenRepository,
  ) {}

  async execute({
    inviterUserId,
    organizationId,
    name,
    email,
    roleId,
  }: InviteOrganizationMemberUseCaseRequest): Promise<void> {
    const organization =
      await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      throw new ResourceNotFoundError("Organização não localizada.");
    }

    await checkUserPermissionForAsset(
      "organization",
      inviterUserId,
      toOrganizationAsset(organization),
      "UPDATE",
    );

    const normalizedEmail = email.trim().toLowerCase();
    const memberAssignment = await this.resolveMemberAssignment(
      roleId,
      organizationId,
    );
    const inviter = await this.usersRepository.findUserById(
      inviterUserId,
      organizationId,
    );

    const existingUser =
      await this.usersRepository.findUserByEmail(normalizedEmail);

    await prisma.$transaction(async (tx) => {
      let userId = existingUser?.id;

      if (!existingUser) {
        const passwordHash = await hash(randomBytes(32).toString("hex"), 6);
        const user = await this.usersRepository.create(
          {
            email: normalizedEmail,
            name,
            organizationId,
            role: Role.USER,
            passwordHash,
          },
          tx,
        );
        userId = user.id;
      }

      if (!userId) {
        throw new ResourceNotFoundError("Usuário não localizado");
      }

      const existingMember =
        await this.organizationsRepository.findMemberByUserIdAndOrganizationId(
          userId,
          organizationId,
          tx,
        );

      if (
        existingMember &&
        !existingMember.removedAt &&
        existingMember.status === MemberStatus.ACTIVE
      ) {
        throw new ConflictError(
          "Este usuário já é membro desta organização.",
        );
      }

      const memberPayload = {
        role: memberAssignment.role,
        customRoleId: memberAssignment.customRoleId,
        status: MemberStatus.PENDING,
      };

      if (existingMember) {
        await this.organizationsRepository.reactivateMember(
          existingMember.id,
          memberPayload,
          tx,
        );
        return;
      }

      await this.organizationsRepository.createMember(
        {
          userId,
          organizationId,
          ...memberPayload,
        },
        tx,
      );
    });

    const token = randomBytes(32).toString("hex");
    const expires = date().add(ORG_INVITE_TOKEN_TTL_HOURS, "hour").toDate();
    const identifier = `${ORG_INVITE_IDENTIFIER_PREFIX}${organizationId}:${normalizedEmail}`;

    await this.verificationTokenRepository.replaceToken(
      identifier,
      token,
      expires,
    );

    const baseUrl = (
      process.env.BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    ).replace(/\/$/, "");

    await sendInviteUserEmail({
      to: normalizedEmail,
      inviterName: inviter?.name ?? "Equipe Zofia Code Labs",
      organizationName: organization.name,
      inviteLink: `${baseUrl}/auth/invite/accept?token=${token}`,
      userEmail: normalizedEmail,
      role: memberAssignment.roleLabel,
    });
  }

  private async resolveMemberAssignment(
    roleId: string,
    organizationId: string,
  ): Promise<ResolvedMemberAssignment> {
    const staticRole = STATIC_ROLES_MAP[roleId];

    if (staticRole) {
      return {
        role: staticRole,
        customRoleId: null,
        roleLabel: STATIC_ROLE_LABELS[roleId] ?? "Membro",
      };
    }

    const customRole =
      await this.organizationsRepository.findCustomRoleById(roleId);

    if (!customRole) {
      throw new ResourceNotFoundError("Perfil de acesso não encontrado.");
    }

    if (customRole.organizationId !== organizationId) {
      throw new ForbiddenError(
        "Acesso negado: Este perfil pertence a outra organização.",
      );
    }

    return {
      role: MemberRole.TENANT_MEMBER,
      customRoleId: customRole.id,
      roleLabel: customRole.name,
    };
  }
}
