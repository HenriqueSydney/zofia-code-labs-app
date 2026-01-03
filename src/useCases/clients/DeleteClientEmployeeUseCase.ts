import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientEmployeesRepository } from "@/repositories/IClientEmployeesRepository";

export class DeleteClientEmployeeUseCase {
  constructor(private clientEmployeesRepository: IClientEmployeesRepository) {}

  async execute(authenticatedUserId: string, employeeId: string) {
    const employee = await this.clientEmployeesRepository.findById(employeeId);
    if (!employee) throw new Error("Funcionário não encontrado.");

    await checkUserPermissionForAsset(
      "clientEmployee",
      authenticatedUserId,
      { organizationId: employee.organizationId },
      "DELETE"
    );

    await this.clientEmployeesRepository.delete(employeeId);
  }
}
