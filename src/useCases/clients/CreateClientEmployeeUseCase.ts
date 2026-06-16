import {
  ClientEmployeeRole,
  ClientEmployeeStatus,
  Role,
} from "@/generated/prisma/enums";
import { assertClientEmployeePermission } from "@/lib/auth/assertClientEmployeePermission";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { ensureTenantObserverMember } from "@/lib/auth/ensureTenantObserverMember";
import { sendClientPortalInvite } from "@/email/send/sendClientPortalInvite";
import { prisma } from "@/lib/prisma";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";
import { IClientsRepository } from "@/repositories/IClientsRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { ResourceNotFoundError, ValidationError, ExternalServiceError } from "@/errors";

interface CreateClientEmployeeUseCaseRequest {
  authenticatedUserId: string;
  clientSlug: string;
  name: string;
  email: string;
  permissionRole: ClientEmployeeRole;
  jobTitle: string;
}

export class CreateClientEmployeeUseCase {
  constructor(
    private clientEmployeesRepository: IClientEmployeesRepository,
    private clientsRepository: IClientsRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute({
    authenticatedUserId,
    clientSlug,
    name,
    email,
    permissionRole,
    jobTitle,
  }: CreateClientEmployeeUseCaseRequest) {
    const client = await this.clientsRepository.findBySlug(clientSlug);

    if (!client) throw new ResourceNotFoundError("Cliente não encontrado.");

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await assertClientEmployeePermission(
        authenticatedUserId,
        client.id,
        "MANAGE_TEAM",
      );
    } catch {
      const isHouseStaff = await prisma.member.findFirst({
        where: {
          userId: authenticatedUserId,
          organizationId: client.organizationId,
          removedAt: null,
          role: { in: ["TENANT_ADMIN", "TENANT_MEMBER"] },
        },
      });

      if (!isHouseStaff) {
        await checkUserPermissionForAsset(
          "clientEmployee",
          authenticatedUserId,
          client,
          "UPDATE",
        );
      }
    }

    const userExists = await this.userRepository.findUserByEmail(normalizedEmail);

    if (userExists) {
      const existingEmployee =
        await this.clientEmployeesRepository.findByClientAndUserIncludingInactive(
          client.id,
          userExists.id,
        );

      if (existingEmployee?.deletedAt === null) {
        throw new ValidationError("Este usuário já está vinculado a este cliente.");
      }

      if (existingEmployee) {
        const inviter = await this.userRepository.findUserById(
          authenticatedUserId,
          client.organizationId,
        );

        await prisma.$transaction(async (tx) => {
          await ensureTenantObserverMember(
            tx,
            userExists.id,
            client.organizationId,
          );
        });

        const reactivated = await this.clientEmployeesRepository.update(
          existingEmployee.id,
          {
            deletedAt: null,
            status: ClientEmployeeStatus.PENDING,
            permissionRole,
            jobTitle,
          },
        );

        await sendClientPortalInvite({
          email: normalizedEmail,
          inviteeName: name,
          inviterName: inviter?.name ?? "Equipe Zofia Code Labs",
          organizationName: client.tradeName,
          clientName: client.tradeName || client.companyName,
          roleLabel:
            permissionRole === ClientEmployeeRole.ADMIN
              ? "Administrador"
              : permissionRole === ClientEmployeeRole.USER
                ? "Colaborador"
                : "Visualizador",
        });

        return reactivated;
      }
    }

    const inviter = await this.userRepository.findUserById(
      authenticatedUserId,
      client.organizationId,
    );

    const result = await prisma.$transaction(async (tx) => {
      let userId: string | undefined = userExists?.id;
      if (!userExists) {
        const passwordHash = await hash(randomUUID(), 6);

        const user = await this.userRepository.create(
          {
            email: normalizedEmail,
            organizationId: client.organizationId,
            name,
            role: Role.USER,
            passwordHash,
          },
          tx,
        );

        userId = user.id;
      }

      if (!userId) {
        throw new ExternalServiceError("Falha ao criar o usuário para o membro da equipe");
      }

      await ensureTenantObserverMember(tx, userId, client.organizationId);

      return await tx.clientEmployees.create({
        data: {
          organizationId: client.organizationId,
          clientId: client.id,
          userId,
          permissionRole,
          jobTitle,
          status: "PENDING",
        },
      });
    });

    await sendClientPortalInvite({
      email: normalizedEmail,
      inviteeName: name,
      inviterName: inviter?.name ?? "Equipe Zofia Code Labs",
      organizationName: client.tradeName,
      clientName: client.tradeName || client.companyName,
      roleLabel:
        permissionRole === ClientEmployeeRole.ADMIN
          ? "Administrador"
          : permissionRole === ClientEmployeeRole.USER
            ? "Colaborador"
            : "Visualizador",
    });

    return result;
  }
}
