import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../errors/ConflictError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { date } from "../../lib/dayjs";
import { InMemoryOrganizationIntegrationRepository } from "../../repositories/in-memory/InMemoryOrganizationIntegrationRepository";
import { InMemoryProjectIntegrationRepository } from "../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { ConnectServiceToProjectUseCase } from "./ConnectServiceToProjectUseCase";
import type { IntegrationFactory } from "../../services/IntegrationFactory";
import type { ISecretManagementService } from "../../services/secretManagement/ISecretManagementService";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let organizationIntegrationRepository: InMemoryOrganizationIntegrationRepository;
let projectsRepository: InMemoryProjectsRepository;
let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let secretManagementService: ISecretManagementService;
let integrationFactory: IntegrationFactory;
let sut: ConnectServiceToProjectUseCase;

describe("ConnectServiceToProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationIntegrationRepository =
      new InMemoryOrganizationIntegrationRepository();
    projectsRepository = new InMemoryProjectsRepository();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();
    secretManagementService = {
      createFolder: vi.fn(),
      upsertSecret: vi.fn(),
      getSecret: vi.fn().mockResolvedValue("secret-value"),
      deleteSecret: vi.fn(),
    };
    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue({
        setupProject: vi.fn().mockResolvedValue({
          externalId: "ext-123",
          metadata: { repo: "my-repo" },
        }),
      }),
    } as unknown as IntegrationFactory;

    sut = new ConnectServiceToProjectUseCase(
      organizationIntegrationRepository,
      projectsRepository,
      projectIntegrationRepository,
      secretManagementService,
      integrationFactory,
    );
  });

  it("deve conectar serviço ao projeto", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const now = date().toDate();
    const integrationTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: randomUUID(),
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(10000),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(10000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    organizationIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: {
        infisical: {
          path: `/${organizationId}/integrations/github`,
          keys: ["token"],
        },
      },
    });

    await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
      serviceId: integration.id,
      data: { repo: "my-repo" },
    });

    expect(projectIntegrationRepository.items).toHaveLength(1);
    expect(integrationFactory.getIntegration).toHaveBeenCalled();
  });

  it("deve lançar ResourceNotFoundError quando projeto não existe", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
        serviceId: randomUUID(),
        data: {},
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar ConflictError quando integração já existe no projeto", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const projectId = randomUUID();
    const now = date().toDate();
    const integrationTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: projectId,
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(10000),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(10000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    organizationIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: {},
    });

    organizationIntegrationRepository.projectIntegrations.push({
      id: randomUUID(),
      projectId,
      organizationIntegrationId: integration.id,
      integrationTypeId,
      config: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "projeto-alpha",
        serviceId: integration.id,
        data: {},
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("deve lançar ResourceNotFoundError quando integração não existe", async () => {
    const organizationId = randomUUID();
    const clientId = randomUUID();
    const now = date().toDate();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: randomUUID(),
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(10000),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(10000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "projeto-alpha",
        serviceId: randomUUID(),
        data: {},
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve criar integração quando setupProject retornar vazio", async () => {
    vi.mocked(integrationFactory.getIntegration).mockResolvedValueOnce({
      setupProject: vi.fn().mockResolvedValue(null),
    } as never);

    const organizationId = randomUUID();
    const clientId = randomUUID();
    const now = date().toDate();
    const integrationTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: randomUUID(),
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(10000),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(10000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    organizationIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: {},
    });

    await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
      serviceId: integration.id,
      data: {},
    });

    expect(projectIntegrationRepository.items).toHaveLength(0);
  });

  it("deve ignorar segredo vazio retornado pelo vault", async () => {
    vi.mocked(secretManagementService.getSecret).mockResolvedValueOnce(null);

    const organizationId = randomUUID();
    const clientId = randomUUID();
    const now = date().toDate();
    const integrationTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Empresa LTDA",
      slug: "empresa",
      tradeName: "Empresa",
    });
    projectsRepository.items.push({
      id: randomUUID(),
      organizationId,
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      clientId,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: new Decimal(10000),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(10000),
      createdBy: randomUUID(),
      memberId: null,
      createdAt: now,
      updatedAt: now,
    });

    organizationIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "GitHub",
      slug: "github",
      logo: null,
      enableByol: false,
      description: null,
      externalDocsUrl: null,
      fieldsSchema: null,
      deletedAt: null,
    });

    const integration = await organizationIntegrationRepository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol: false,
      healthStatus: "HEALTHY",
      config: {
        infisical: {
          path: `/${organizationId}/integrations/github`,
          keys: ["token"],
        },
      },
    });

    await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
      serviceId: integration.id,
      data: {},
    });

    expect(integrationFactory.getIntegration).toHaveBeenCalledWith(
      expect.objectContaining({ providedSecrets: {} }),
    );
  });
});
