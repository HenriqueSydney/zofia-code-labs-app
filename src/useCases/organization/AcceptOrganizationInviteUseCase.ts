import { ResourceNotFoundError, ValidationError } from "@/errors";
import { ORG_INVITE_IDENTIFIER_PREFIX } from "@/constants/orgInvite";
import { MemberStatus } from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { IVerificationTokenRepository } from "@/repositories/IVerificationTokenRepository";

interface AcceptOrganizationInviteUseCaseRequest {
  token: string;
}

interface AcceptOrganizationInviteUseCaseResponse {
  userId: string;
  organizationId: string;
  email: string;
  token: string;
}

export class AcceptOrganizationInviteUseCase {
  constructor(
    private verificationTokenRepository: IVerificationTokenRepository,
    private usersRepository: IUserRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async execute({
    token,
  }: AcceptOrganizationInviteUseCaseRequest): Promise<AcceptOrganizationInviteUseCaseResponse> {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
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

    return {
      userId: user.id,
      organizationId,
      email,
      token: trimmedToken,
    };
  }
}
