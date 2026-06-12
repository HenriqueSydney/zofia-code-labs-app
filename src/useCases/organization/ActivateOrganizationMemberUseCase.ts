import { sendUserJoinedNotification } from "@/email/send/sendUserJoinedNotification";
import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";

interface ActivateOrganizationMemberUseCaseRequest {
  memberId: string;
  organizationId: string;
  userId: string;
}

export class ActivateOrganizationMemberUseCase {
  constructor(
    private organizationsRepository: IOrganizationsRepository,
    private usersRepository: IUserRepository,
  ) {}

  async execute({
    memberId,
    organizationId,
    userId,
  }: ActivateOrganizationMemberUseCaseRequest): Promise<void> {
    await this.organizationsRepository.activateMember(memberId);

    const [userProfile, organization] = await Promise.all([
      this.usersRepository.findUserByIdAndReturnAllInfo(userId),
      this.organizationsRepository.findById(organizationId),
    ]);

    if (!userProfile?.email || !organization) {
      return;
    }

    const admins =
      await this.organizationsRepository.findOrganizationAdminContacts(
        organizationId,
      );

    const baseUrl = (
      process.env.BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const teamManagementUrl = `${baseUrl}/organization/${organizationId}/members`;

    for (const admin of admins) {
      if (admin.email === userProfile.email) {
        continue;
      }

      try {
        await sendUserJoinedNotification({
          to: admin.email,
          adminName: admin.name ?? "Administrador",
          newUserName: userProfile.name ?? userProfile.email,
          newUserEmail: userProfile.email,
          teamName: organization.name,
          teamManagementUrl,
        });
      } catch (error) {
        console.error("Erro ao notificar admin sobre novo membro:", error);
      }
    }
  }
}
