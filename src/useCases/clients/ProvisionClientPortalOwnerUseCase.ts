import { randomUUID } from "crypto";
import { hash } from "bcryptjs";

import { Client, Role } from "@/generated/prisma/client";
import { ClientEmployeeRole } from "@/generated/prisma/enums";
import { assertClientHasResponsible } from "@/lib/clients/assertClientHasResponsible";
import { isClientFirstProjectReachingContractSigning } from "@/lib/clients/welcomeClientEmail";
import { sendClientPortalInvite } from "@/email/send/sendClientPortalInvite";
import { ensureTenantObserverMember } from "@/lib/auth/ensureTenantObserverMember";
import { prisma } from "@/lib/prisma";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";

export type ProvisionClientPortalOwnerParams = {
  client: Pick<
    Client,
    | "id"
    | "organizationId"
    | "tradeName"
    | "companyName"
    | "responsibleName"
    | "responsibleEmail"
    | "responsiblePhone"
  >;
  projectId: string;
  inviterUserId?: string;
  inviterName?: string;
  organizationName?: string;
  resendInviteIfPending?: boolean;
};

export class ProvisionClientPortalOwnerUseCase {
  constructor(
    private clientEmployeesRepository: IClientEmployeesRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute({
    client,
    projectId,
    inviterUserId,
    inviterName = "Equipe Zofia Code Labs",
    organizationName = "Zofia Code Labs",
    resendInviteIfPending = true,
  }: ProvisionClientPortalOwnerParams) {
    assertClientHasResponsible(client);

    const email = client.responsibleEmail!.trim().toLowerCase();
    const name = client.responsibleName!.trim();
    const shouldSendInviteEmail =
      await isClientFirstProjectReachingContractSigning(client.id, projectId);

    const existingByEmail =
      await this.clientEmployeesRepository.findByClientAndEmail(
        client.id,
        email,
      );

    if (existingByEmail) {
      await prisma.$transaction(async (tx) => {
        await ensureTenantObserverMember(
          tx,
          existingByEmail.userId,
          client.organizationId,
        );
      });

      if (
        shouldSendInviteEmail &&
        resendInviteIfPending &&
        existingByEmail.status === "PENDING"
      ) {
        await sendClientPortalInvite({
          email,
          inviteeName: name,
          inviterName,
          organizationName,
          clientName: client.tradeName || client.companyName,
        });
      }

      return existingByEmail;
    }

    const result = await prisma.$transaction(async (tx) => {
      let user = await this.userRepository.findUserByEmail(email);

      if (!user) {
        user = await this.userRepository.create(
          {
            email,
            name,
            organizationId: client.organizationId,
            role: Role.USER,
            passwordHash: await hash(randomUUID(), 6),
          },
          tx,
        );
      }

      await ensureTenantObserverMember(tx, user.id, client.organizationId);

      const employee = await tx.clientEmployees.create({
        data: {
          organizationId: client.organizationId,
          clientId: client.id,
          userId: user.id,
          permissionRole: ClientEmployeeRole.ADMIN,
          jobTitle: "Responsável",
          status: "PENDING",
        },
      });

      return employee;
    });

    if (shouldSendInviteEmail) {
      await sendClientPortalInvite({
        email,
        inviteeName: name,
        inviterName,
        organizationName,
        clientName: client.tradeName || client.companyName,
      });
    }

    return result;
  }
}
