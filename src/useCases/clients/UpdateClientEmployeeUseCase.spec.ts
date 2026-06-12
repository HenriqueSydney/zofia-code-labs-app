import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { UpdateClientEmployeeUseCase } from "./UpdateClientEmployeeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let clientEmployeesRepository: InMemoryClientEmployeesRepository;
let sut: UpdateClientEmployeeUseCase;

describe("UpdateClientEmployeeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    sut = new UpdateClientEmployeeUseCase(clientEmployeesRepository);
  });

  it("deve atualizar funcionário existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const authenticatedUserId = randomUUID();

    const employee = await clientEmployeesRepository.create({
      organizationId,
      clientId,
      userId,
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    const updated = await sut.execute({
      authenticatedUserId,
      employeeId: employee.id,
      jobTitle: "Coordenador",
      permissionRole: ClientEmployeeRole.ADMIN,
    });

    expect(updated.jobTitle).toBe("Coordenador");
    expect(updated.permissionRole).toBe(ClientEmployeeRole.ADMIN);
  });

  it("não deve atualizar funcionário inexistente", async () => {
    await expect(() =>
      sut.execute({
        authenticatedUserId: randomUUID(),
        employeeId: randomUUID(),
        jobTitle: "X",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
