import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateClientEmployeeUseCase } from "./CreateClientEmployeeUseCase";

vi.mock("@/lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/assertClientEmployeePermission", () => ({
  assertClientEmployeePermission: vi.fn().mockRejectedValue(new Error("no permission")),
}));

vi.mock("@/lib/auth/ensureTenantObserverMember", () => ({
  ensureTenantObserverMember: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/email/send/sendClientPortalInvite", () => ({
  sendClientPortalInvite: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        clientEmployees: {
          create: vi.fn(({ data }: { data: Record<string, unknown> }) => ({
            id: randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })),
        },
      };
      return callback(tx);
    }),
  },
}));

let clientEmployeesRepository: InMemoryClientEmployeesRepository;
let clientsRepository: InMemoryClientsRepository;
let userRepository: InMemoryUsersRepository;
let sut: CreateClientEmployeeUseCase;

describe("CreateClientEmployeeUseCase", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    clientsRepository = new InMemoryClientsRepository();
    userRepository = new InMemoryUsersRepository();
    sut = new CreateClientEmployeeUseCase(
      clientEmployeesRepository,
      clientsRepository,
      userRepository,
    );
    const { assertClientEmployeePermission } = await import(
      "@/lib/auth/assertClientEmployeePermission"
    );
    vi.mocked(assertClientEmployeePermission).mockRejectedValue(
      new Error("no permission"),
    );
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.member.findFirst).mockResolvedValue(null);
  });

  it("deve criar funcionário do cliente e enviar convite", async () => {
    const { checkUserPermissionForAsset } = await import(
      "@/lib/auth/checkUserPermissionForAsset"
    );
    const organizationId = randomUUID();
    const authenticatedUserId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    await userRepository.create({
      email: "admin@zofia.com",
      organizationId,
      name: "Admin",
      role: "USER",
      passwordHash: "hash",
    });

    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const result = await sut.execute({
      authenticatedUserId,
      clientSlug: client.slug,
      name: "João Silva",
      email: "joao@empresa.com",
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    expect(result.status).toBe("PENDING");
    expect(result.clientId).toBe(client.id);
    expect(checkUserPermissionForAsset).toHaveBeenCalledWith(
      "clientEmployee",
      authenticatedUserId,
      expect.objectContaining({ id: client.id }),
      "UPDATE",
    );
    expect(sendClientPortalInvite).toHaveBeenCalled();
  });

  it("não deve criar funcionário para cliente inexistente", async () => {
    await expect(() =>
      sut.execute({
        authenticatedUserId: randomUUID(),
        clientSlug: "inexistente",
        name: "João",
        email: "joao@test.com",
        permissionRole: ClientEmployeeRole.USER,
        jobTitle: "Analista",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve vincular usuário já associado ao cliente", async () => {
    const organizationId = randomUUID();
    const authenticatedUserId = randomUUID();
    const clientId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const user = await userRepository.create({
      email: "joao@empresa.com",
      organizationId,
      name: "João",
      role: "USER",
      passwordHash: "hash",
    });

    await clientEmployeesRepository.create({
      organizationId,
      clientId: client.id,
      userId: user.id,
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    await expect(() =>
      sut.execute({
        authenticatedUserId,
        clientSlug: client.slug,
        name: "João Silva",
        email: "joao@empresa.com",
        permissionRole: ClientEmployeeRole.USER,
        jobTitle: "Analista",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve reativar funcionário desativado e enviar novo convite", async () => {
    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );
    const organizationId = randomUUID();
    const authenticatedUserId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const user = await userRepository.create({
      email: "joao@empresa.com",
      organizationId,
      name: "João",
      role: "USER",
      passwordHash: "hash",
    });

    const inactiveEmployee = await clientEmployeesRepository.create({
      organizationId,
      clientId: client.id,
      userId: user.id,
      permissionRole: ClientEmployeeRole.VIEWER,
      jobTitle: "Antigo cargo",
      status: "INACTIVE",
    });

    await clientEmployeesRepository.delete(inactiveEmployee.id);

    const result = await sut.execute({
      authenticatedUserId,
      clientSlug: client.slug,
      name: "João Silva",
      email: "joao@empresa.com",
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Gerente",
    });

    expect(result.id).toBe(inactiveEmployee.id);
    expect(result.deletedAt).toBeNull();
    expect(result.status).toBe("PENDING");
    expect(result.permissionRole).toBe(ClientEmployeeRole.ADMIN);
    expect(result.jobTitle).toBe("Gerente");
    expect(sendClientPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "joao@empresa.com",
        roleLabel: "Administrador",
      }),
    );
    expect(clientEmployeesRepository.items).toHaveLength(1);
  });

  it("deve criar funcionário quando usuário do portal tem permissão", async () => {
    const { assertClientEmployeePermission } = await import(
      "@/lib/auth/assertClientEmployeePermission"
    );
    const { checkUserPermissionForAsset } = await import(
      "@/lib/auth/checkUserPermissionForAsset"
    );
    const { prisma } = await import("@/lib/prisma");

    vi.mocked(assertClientEmployeePermission).mockResolvedValue(undefined);

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

    const result = await sut.execute({
      authenticatedUserId: randomUUID(),
      clientSlug: client.slug,
      name: "Ana Portal",
      email: "ana@empresa.com",
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Admin",
    });

    expect(result.clientId).toBe(client.id);
    expect(result.permissionRole).toBe(ClientEmployeeRole.ADMIN);
    expect(result.status).toBe("PENDING");
    expect(assertClientEmployeePermission).toHaveBeenCalledWith(
      expect.any(String),
      client.id,
      "MANAGE_TEAM",
    );
    expect(checkUserPermissionForAsset).not.toHaveBeenCalled();
    expect(prisma.member.findFirst).not.toHaveBeenCalled();
  });

  it("deve reutilizar usuário existente sem criar novo registro", async () => {
    const organizationId = randomUUID();
    const authenticatedUserId = randomUUID();

    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const existingUser = await userRepository.create({
      email: "existente@empresa.com",
      organizationId,
      name: "Usuário Existente",
      role: "USER",
      passwordHash: "hash",
    });

    const result = await sut.execute({
      authenticatedUserId,
      clientSlug: client.slug,
      name: "Usuário Existente",
      email: "EXISTENTE@empresa.com",
      permissionRole: ClientEmployeeRole.VIEWER,
      jobTitle: "Visualizador",
    });

    expect(result.userId).toBe(existingUser.id);
    expect(userRepository.items.filter((u) => u.email === "existente@empresa.com")).toHaveLength(1);
  });

  it("deve permitir criação por house staff sem checkUserPermissionForAsset", async () => {
    const { checkUserPermissionForAsset } = await import(
      "@/lib/auth/checkUserPermissionForAsset"
    );
    const { prisma } = await import("@/lib/prisma");

    vi.mocked(prisma.member.findFirst).mockResolvedValueOnce({
      id: randomUUID(),
      role: "TENANT_ADMIN",
    } as never);

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

    const result = await sut.execute({
      authenticatedUserId: randomUUID(),
      clientSlug: client.slug,
      name: "Staff Interno",
      email: "staff@zofia.com",
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "CS",
    });

    expect(result.status).toBe("PENDING");
    expect(checkUserPermissionForAsset).not.toHaveBeenCalled();
  });

  it("deve enviar convite com rótulo Administrador para role ADMIN", async () => {
    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );
    const { assertClientEmployeePermission } = await import(
      "@/lib/auth/assertClientEmployeePermission"
    );
    vi.mocked(assertClientEmployeePermission).mockResolvedValue(undefined);

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

    await sut.execute({
      authenticatedUserId: randomUUID(),
      clientSlug: client.slug,
      name: "Admin Portal",
      email: "admin@empresa.com",
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Diretor",
    });

    expect(sendClientPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({ roleLabel: "Administrador" }),
    );
  });

  it("deve enviar convite com rótulo Colaborador para role USER", async () => {
    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

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

    await sut.execute({
      authenticatedUserId: randomUUID(),
      clientSlug: client.slug,
      name: "Colaborador",
      email: "user@empresa.com",
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    expect(sendClientPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({ roleLabel: "Colaborador" }),
    );
  });

  it("deve usar nome do convidador quando usuário autenticado existe", async () => {
    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const organizationId = randomUUID();
    const inviter = await userRepository.create({
      email: "gestor@zofia.com",
      organizationId,
      name: "Gestor Zofia",
      role: "USER",
      passwordHash: "hash",
    });
    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    await sut.execute({
      authenticatedUserId: inviter.id,
      clientSlug: client.slug,
      name: "Novo Membro",
      email: "novo@empresa.com",
      permissionRole: ClientEmployeeRole.USER,
      jobTitle: "Analista",
    });

    expect(sendClientPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({ inviterName: "Gestor Zofia" }),
    );
  });

  it("deve enviar convite com rótulo Visualizador para role VIEWER", async () => {
    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const organizationId = randomUUID();
    const client = await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    await sut.execute({
      authenticatedUserId: randomUUID(),
      clientSlug: client.slug,
      name: "Visitante",
      email: "visitante@empresa.com",
      permissionRole: ClientEmployeeRole.VIEWER,
      jobTitle: "Visitante",
    });

    expect(sendClientPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        roleLabel: "Visualizador",
        clientName: "Empresa LTDA",
        inviterName: "Equipe Zofia Code Labs",
      }),
    );
  });
});
