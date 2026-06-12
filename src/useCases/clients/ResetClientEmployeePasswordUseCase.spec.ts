import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ResetClientEmployeePasswordUseCase } from "./ResetClientEmployeePasswordUseCase";

vi.mock("@/lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("new-hashed-password"),
}));

let clientEmployeesRepository: InMemoryClientEmployeesRepository;
let clientsRepository: InMemoryClientsRepository;
let userRepository: InMemoryUsersRepository;
let sut: ResetClientEmployeePasswordUseCase;

describe("ResetClientEmployeePasswordUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    clientsRepository = new InMemoryClientsRepository();
    userRepository = new InMemoryUsersRepository();
    sut = new ResetClientEmployeePasswordUseCase(
      clientEmployeesRepository,
      clientsRepository,
      userRepository,
    );
  });

  it("deve redefinir senha do funcionário do cliente", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const employeeUser = await userRepository.create({
      email: "joao@empresa.com",
      organizationId,
      name: "João",
      role: "USER",
      passwordHash: "old-hash",
    });

    const employee = await clientEmployeesRepository.create({
      organizationId,
      clientId: client.id,
      userId: employeeUser.id,
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    await sut.execute({
      userId,
      clientSlug: client.slug,
      employeeId: employee.id,
    });

    const updatedUser = userRepository.items.find(
      (item) => item.id === employeeUser.id,
    );
    expect(updatedUser?.passwordHash).toBe("new-hashed-password");
  });

  it("não deve redefinir senha quando cliente não existe", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        clientSlug: "inexistente",
        employeeId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve redefinir senha quando funcionário não pertence ao cliente", async () => {
    const organizationId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const employee = await clientEmployeesRepository.create({
      organizationId,
      clientId: randomUUID(),
      userId: randomUUID(),
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        clientSlug: client.slug,
        employeeId: employee.id,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve redefinir senha quando funcionário não existe", async () => {
    const organizationId = randomUUID();
    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        clientSlug: client.slug,
        employeeId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
