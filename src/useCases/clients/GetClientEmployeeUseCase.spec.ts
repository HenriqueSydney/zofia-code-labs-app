import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { GetClientEmployeeUseCase } from "./GetClientEmployeeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let clientEmployeesRepository: InMemoryClientEmployeesRepository;
let sut: GetClientEmployeeUseCase;

describe("GetClientEmployeeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    sut = new GetClientEmployeeUseCase(clientEmployeesRepository);
  });

  it("deve retornar funcionário existente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const authenticatedUserId = randomUUID();

    const employee = await clientEmployeesRepository.create({
      organizationId,
      clientId,
      userId,
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Gerente",
    });

    const result = await sut.execute(authenticatedUserId, employee.id);

    expect(result.id).toBe(employee.id);
    expect(result.jobTitle).toBe("Gerente");
  });

  it("não deve retornar funcionário inexistente", async () => {
    await expect(() =>
      sut.execute(randomUUID(), randomUUID()),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
