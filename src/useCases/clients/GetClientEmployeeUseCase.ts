import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";

export class GetClientEmployeeUseCase {
  constructor(private clientEmployeesRepository: IClientEmployeesRepository) {}

  async execute(authenticatedUserId: string, employeeId: string) {
    const employee = await this.clientEmployeesRepository.findById(employeeId);

    if (!employee) throw new ResourceNotFoundError("Registro não encontrado.");

    await checkUserPermissionForAsset(
      "clientEmployee",
      authenticatedUserId,
      { organizationId: employee.organizationId },
      "READ"
    );

    return employee;
  }
}
