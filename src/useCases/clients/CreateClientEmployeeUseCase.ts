import { ClientEmployeeRole } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";
import { IClientsRepository } from "@/repositories/IClientsRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { AppError } from "@/errors/AppError";

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

    if (!client) throw new Error("Cliente não encontrado.");

    await checkUserPermissionForAsset(
      "clientEmployee",
      authenticatedUserId,
      client,
      "UPDATE",
    );

    const userExists = await this.userRepository.findUserByEmail(email);

    if (userExists) {
      const alreadyMember =
        await this.clientEmployeesRepository.findByClientAndUser(
          client.id,
          userExists.id,
        );

      if (alreadyMember) {
        throw new AppError("Este usuário já está vinculado a este cliente.");
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let userId: string | undefined = userExists?.id;
      if (!userExists) {
        const passwordHash = await hash(randomUUID(), 6);

        const user = await this.userRepository.create({
          email,
          organizationId: client.organizationId,
          name,
          role: "TENANT_OBSERVER",
          passwordHash,
        });

        userId = user.id;
      }

      if (!userId) {
        throw new AppError("Falha ao criar o usuário para o membro da equipe");
      }

      return await this.clientEmployeesRepository.create({
        organizationId: client.organizationId,
        clientId: client.id,
        userId,
        permissionRole,
        jobTitle,
        status: "PENDING",
      });
    });

    return result;
  }
}
