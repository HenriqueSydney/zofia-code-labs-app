import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../errors/ValidationError";
import { ClientEmployeeRole } from "../../generated/prisma/enums";
import { InMemoryClientEmployeesRepository } from "../../repositories/in-memory/InMemoryClientEmployeesRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ProvisionClientPortalOwnerUseCase } from "./ProvisionClientPortalOwnerUseCase";

vi.mock("@/lib/auth/ensureTenantObserverMember", () => ({
  ensureTenantObserverMember: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/email/send/sendClientPortalInvite", () => ({
  sendClientPortalInvite: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/clients/welcomeClientEmail", () => ({
  isClientFirstProjectReachingContractSigning: vi.fn().mockResolvedValue(true),
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
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
let userRepository: InMemoryUsersRepository;
let sut: ProvisionClientPortalOwnerUseCase;

describe("ProvisionClientPortalOwnerUseCase", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { isClientFirstProjectReachingContractSigning } = await import(
      "@/lib/clients/welcomeClientEmail"
    );
    vi.mocked(isClientFirstProjectReachingContractSigning).mockResolvedValue(true);
    clientEmployeesRepository = new InMemoryClientEmployeesRepository();
    userRepository = new InMemoryUsersRepository();
    sut = new ProvisionClientPortalOwnerUseCase(
      clientEmployeesRepository,
      userRepository,
    );
  });

  it("deve provisionar responsável legal como admin do portal", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();

    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const result = await sut.execute({
      client: {
        id: clientId,
        organizationId,
        tradeName: "Empresa",
        companyName: "Empresa LTDA",
        responsibleName: "Maria Souza",
        responsibleEmail: "maria@empresa.com",
        responsiblePhone: "11999999999",
      },
      projectId,
    });

    expect(result.permissionRole).toBe(ClientEmployeeRole.ADMIN);
    expect(result.jobTitle).toBe("Responsável");
    expect(sendClientPortalInvite).toHaveBeenCalled();
  });

  it("deve reenviar convite quando responsável já existe e está pendente", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();
    const email = "maria@empresa.com";

    clientEmployeesRepository.users.push({
      id: randomUUID(),
      organizationId,
      name: "Maria Souza",
      email,
      emailVerified: null,
      passwordHash: "hash",
      image: null,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = clientEmployeesRepository.users[0];

    await clientEmployeesRepository.create({
      organizationId,
      clientId,
      userId: user.id,
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Responsável",
      status: "PENDING",
    });

    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const result = await sut.execute({
      client: {
        id: clientId,
        organizationId,
        tradeName: "Empresa",
        companyName: "Empresa LTDA",
        responsibleName: "Maria Souza",
        responsibleEmail: email,
        responsiblePhone: "11999999999",
      },
      projectId,
      resendInviteIfPending: true,
    });

    expect(result.status).toBe("PENDING");
    expect(sendClientPortalInvite).toHaveBeenCalled();
  });

  it("deve lançar ValidationError quando responsável legal não está cadastrado", async () => {
    await expect(() =>
      sut.execute({
        client: {
          id: randomUUID(),
          organizationId: randomUUID(),
          tradeName: "Empresa",
          companyName: "Empresa LTDA",
          responsibleName: null,
          responsibleEmail: null,
          responsiblePhone: null,
        },
        projectId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve reenviar convite quando responsável já está ativo", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();
    const email = "ativa@empresa.com";

    clientEmployeesRepository.users.push({
      id: randomUUID(),
      organizationId,
      name: "Maria Ativa",
      email,
      emailVerified: new Date(),
      passwordHash: "hash",
      image: null,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = clientEmployeesRepository.users[0];

    await clientEmployeesRepository.create({
      organizationId,
      clientId,
      userId: user.id,
      permissionRole: ClientEmployeeRole.ADMIN,
      jobTitle: "Responsável",
      status: "ACTIVE",
    });

    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const result = await sut.execute({
      client: {
        id: clientId,
        organizationId,
        tradeName: "Empresa",
        companyName: "Empresa LTDA",
        responsibleName: "Maria Ativa",
        responsibleEmail: email,
        responsiblePhone: "11999999999",
      },
      projectId,
    });

    expect(result.status).toBe("ACTIVE");
    expect(sendClientPortalInvite).not.toHaveBeenCalled();
  });

  it("não deve enviar convite quando não é o primeiro projeto em fase de assinatura", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();

    const { isClientFirstProjectReachingContractSigning } = await import(
      "@/lib/clients/welcomeClientEmail"
    );
    vi.mocked(isClientFirstProjectReachingContractSigning).mockResolvedValue(
      false,
    );

    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );

    const result = await sut.execute({
      client: {
        id: clientId,
        organizationId,
        tradeName: "Empresa",
        companyName: "Empresa LTDA",
        responsibleName: "Maria Souza",
        responsibleEmail: "maria@empresa.com",
        responsiblePhone: "11999999999",
      },
      projectId,
    });

    expect(result.permissionRole).toBe(ClientEmployeeRole.ADMIN);
    expect(sendClientPortalInvite).not.toHaveBeenCalled();
  });

  it("deve reutilizar usuário existente e usar companyName quando tradeName estiver vazio", async () => {
    const { sendClientPortalInvite } = await import(
      "@/email/send/sendClientPortalInvite"
    );
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();
    const email = "owner@empresa.com";

    await userRepository.create({
      email,
      organizationId,
      name: "Owner Existente",
      role: "USER",
      passwordHash: "hash",
    });

    await sut.execute({
      client: {
        id: clientId,
        organizationId,
        tradeName: "",
        companyName: "Empresa LTDA",
        responsibleName: "Owner Existente",
        responsibleEmail: email,
        responsiblePhone: "11999999999",
      },
      projectId,
    });

    expect(sendClientPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: "Empresa LTDA" }),
    );
    expect(userRepository.items.filter((u) => u.email === email)).toHaveLength(1);
  });
});
