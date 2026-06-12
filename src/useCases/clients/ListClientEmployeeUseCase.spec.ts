import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberRole } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { date } from "../../lib/dayjs";
import { assertClientAccessForUser } from "../../lib/auth/resolveClientAccess";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { ListClientEmployeeUseCase } from "./ListClientEmployeeUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
}));

let clientEmployeesRepository: InMemoryClientEmployeesRepository;
let clientsRepository: InMemoryClientsRepository;
let sut: ListClientEmployeeUseCase;

describe("ListClientEmployeeUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertClientAccessForUser).mockResolvedValue(undefined);
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    clientsRepository = new InMemoryClientsRepository();
    sut = new ListClientEmployeeUseCase(
      clientEmployeesRepository,
      clientsRepository,
    );
  });

  it("deve listar funcionários do cliente existente", async () => {
    const organizationId = randomUUID();
    const authenticatedUserId = randomUUID();
    const employeeUserId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    clientEmployeesRepository.users.push({
      id: employeeUserId,
      organizationId,
      name: "João Silva",
      email: "joao@empresa.com",
      emailVerified: null,
      passwordHash: null,
      image: null,
      role: "USER",
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
    });

    await clientEmployeesRepository.create({
      organizationId,
      clientId: client.id,
      userId: employeeUserId,
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    const result = await sut.execute({
      authenticatedUserId,
      slug: "empresa",
    });

    expect(result).toHaveLength(1);
    expect(result[0].user.email).toBe("joao@empresa.com");
    expect(result[0].jobTitle).toBe("Analista");
  });

  it("não deve listar funcionários de cliente inexistente", async () => {
    await expect(() =>
      sut.execute({
        authenticatedUserId: randomUUID(),
        slug: "inexistente",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve usar assertClientAccessForUser com memberRole do observer", async () => {
    const organizationId = randomUUID();
    const authenticatedUserId = randomUUID();
    const employeeUserId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    clientEmployeesRepository.users.push({
      id: employeeUserId,
      organizationId,
      name: "Ana Portal",
      email: "ana@empresa.com",
      emailVerified: null,
      passwordHash: null,
      image: null,
      role: "USER",
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
    });

    await clientEmployeesRepository.create({
      organizationId,
      clientId: client.id,
      userId: employeeUserId,
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Admin Portal",
    });

    const result = await sut.execute({
      authenticatedUserId,
      slug: client.slug,
      memberRole: MemberRole.TENANT_OBSERVER,
    });

    expect(result).toHaveLength(1);
    expect(assertClientAccessForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: authenticatedUserId,
        memberRole: MemberRole.TENANT_OBSERVER,
        clientSlug: "empresa",
        assetType: "clientEmployee",
        operation: "READ",
      }),
    );
  });
});
