import { ResourceNotFoundError, ValidationError } from "@/errors";
import { ORG_INVITE_IDENTIFIER_PREFIX } from "@/constants/orgInvite";
import { MemberStatus, Role } from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { IVerificationTokenRepository } from "@/repositories/IVerificationTokenRepository";
import { ActivateOrganizationMemberUseCase } from "./ActivateOrganizationMemberUseCase";

interface CompleteOrganizationInviteLoginUseCaseRequest {
  userId: string;
  inviteToken: string;
}

export interface CompleteOrganizationInviteLoginUseCaseResponse {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  organizationId: string;
}

export class CompleteOrganizationInviteLoginUseCase {
  constructor(
    private verificationTokenRepository: IVerificationTokenRepository,
    private usersRepository: IUserRepository,
    private organizationsRepository: IOrganizationsRepository,
    private activateOrganizationMemberUseCase: ActivateOrganizationMemberUseCase,
  ) {}

  async execute({
    userId,
    inviteToken,
  }: CompleteOrganizationInviteLoginUseCaseRequest): Promise<CompleteOrganizationInviteLoginUseCaseResponse> {
    const trimmedToken = inviteToken.trim();

    if (!trimmedToken || !userId) {
      throw new ValidationError("Link de convite inválido.");
    }

    const verificationToken =
      await this.verificationTokenRepository.findByToken(trimmedToken);

    if (!verificationToken) {
      throw new ValidationError("Link de convite inválido ou expirado.");
    }

    if (date(verificationToken.expires).isBefore(date())) {
      await this.verificationTokenRepository.deleteByIdentifier(
        verificationToken.identifier,
      );
      throw new ValidationError("Link de convite expirado.");
    }

    if (
      !verificationToken.identifier.startsWith(ORG_INVITE_IDENTIFIER_PREFIX)
    ) {
      throw new ValidationError("Link de convite inválido.");
    }

    const identifierPayload = verificationToken.identifier.slice(
      ORG_INVITE_IDENTIFIER_PREFIX.length,
    );
    const separatorIndex = identifierPayload.indexOf(":");

    if (separatorIndex === -1) {
      throw new ValidationError("Link de convite inválido.");
    }

    const organizationId = identifierPayload.slice(0, separatorIndex);
    const email = identifierPayload.slice(separatorIndex + 1);

    if (!organizationId || !email) {
      throw new ValidationError("Link de convite inválido.");
    }

    const user = await this.usersRepository.findUserByEmail(email);

    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    if (user.id !== userId) {
      throw new ValidationError("Convite não corresponde ao usuário informado.");
    }

    const member =
      await this.organizationsRepository.findMemberByUserIdAndOrganizationId(
        user.id,
        organizationId,
      );

    if (!member || member.removedAt) {
      throw new ValidationError("Convite não encontrado para este usuário.");
    }

    if (member.status !== MemberStatus.PENDING) {
      throw new ValidationError("Este convite já foi aceito.");
    }

    await this.verificationTokenRepository.deleteByIdentifier(
      verificationToken.identifier,
    );

    await this.activateOrganizationMemberUseCase.execute({
      memberId: member.id,
      organizationId,
      userId: user.id,
    });

    const userWithSessionData =
      await this.usersRepository.findUserByIdAndReturnAllInfo(user.id);

    if (!userWithSessionData) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    return {
      id: user.id,
      email: userWithSessionData.email,
      name: userWithSessionData.name,
      image: userWithSessionData.image,
      role: userWithSessionData.role,
      organizationId: userWithSessionData.organizationId,
    };
  }
}
