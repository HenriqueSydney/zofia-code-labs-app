import { ClientEmployeeRole } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";
import { IClientsRepository } from "@/repositories/IClientsRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { AppError } from "@/errors/AppError";

interface ResetClientEmployeePasswordUseCaseRequest {
  userId: string;
  clientSlug: string;
  employeeId: string;
}

export class ResetClientEmployeePasswordUseCase {
  constructor(
    private clientEmployeesRepository: IClientEmployeesRepository,
    private clientsRepository: IClientsRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    clientSlug,
    employeeId,
  }: ResetClientEmployeePasswordUseCaseRequest): Promise<void> {
    const client = await this.clientsRepository.findBySlug(clientSlug);

    if (!client) throw new Error("Cliente não encontrado.");

    await checkUserPermissionForAsset(
      "clientEmployee",
      userId,
      { organizationId: client.organizationId },
      "UPDATE"
    );

    const employeeExists = await this.clientEmployeesRepository.findById(
      employeeId
    );

    if (!employeeExists) {
      throw new AppError("Usuário não associado à empresa");
    }

    if (employeeExists.clientId !== client.id) {
      throw new AppError("Usuário não associado à empresa");
    }

    const passwordHash = await hash(randomUUID(), 6);

    await this.userRepository.updatePassword(
      employeeExists.userId,
      passwordHash
    );
  }
}
