import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { DeleteClientEmployeeUseCase } from "./DeleteClientEmployeeUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let clientEmployeesRepository: InMemoryClientEmployeesRepository;
let sut: DeleteClientEmployeeUseCase;

describe("DeleteClientEmployeeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    sut = new DeleteClientEmployeeUseCase(clientEmployeesRepository);
  });

  it("deve remover funcionário existente", async () => {
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

    await sut.execute(authenticatedUserId, employee.id);

    const found = await clientEmployeesRepository.findById(employee.id);
    expect(found).toBeNull();
  });

  it("não deve remover funcionário inexistente", async () => {
    await expect(() =>
      sut.execute(randomUUID(), randomUUID()),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
