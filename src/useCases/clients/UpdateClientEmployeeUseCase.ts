import { ClientEmployeeRole } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";

interface UpdateClientEmployeeUseCaseRequest {
  authenticatedUserId: string;
  employeeId: string;
  permissionRole?: ClientEmployeeRole;
  jobTitle?: string;
}

export class UpdateClientEmployeeUseCase {
  constructor(private clientEmployeesRepository: IClientEmployeesRepository) {}

  async execute({
    authenticatedUserId,
    employeeId,
    ...data
  }: UpdateClientEmployeeUseCaseRequest) {
    const employee = await this.clientEmployeesRepository.findById(employeeId);

    if (!employee) throw new Error("Funcionário não encontrado.");

    await checkUserPermissionForAsset(
      "clientEmployee",
      authenticatedUserId,
      { organizationId: employee.organizationId },
      "UPDATE"
    );

    return await this.clientEmployeesRepository.update(employeeId, data);
  }
}
