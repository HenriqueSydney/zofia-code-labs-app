import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import {
  sendDevStartEmail,
  sendHomologationReadyEmail,
  sendProjectHandover,
} from "@/email/send";
import { InMemoryAuditLogRepository } from "../../repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryProjectNotesRepository } from "../../repositories/in-memory/InMemoryProjectNotesRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ChangeProjectStatusUseCase } from "./ChangeProjectStatusUseCase";

vi.mock("@/email/send", () => ({
  sendDevStartEmail: vi.fn().mockResolvedValue(undefined),
  sendHomologationReadyEmail: vi.fn().mockResolvedValue(undefined),
  sendProjectHandover: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback({})),
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() =>
    Promise.resolve((key: string) => key),
  ),
}));

vi.mock("@/mappers/projectStageMapper", () => ({
  findTranslatedStage: vi.fn((status: string) => ({
    label: status,
    shortLabel: status,
    description: "",
    key: status,
    icon: () => null,
    color: "",
  })),
}));

let projectsRepository: InMemoryProjectsRepository;
let projectNotesRepository: InMemoryProjectNotesRepository;
let auditLogRepository: InMemoryAuditLogRepository;
let usersRepository: InMemoryUsersRepository;
let sut: ChangeProjectStatusUseCase;

describe("ChangeProjectStatusUseCase", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    projectsRepository = new InMemoryProjectsRepository();
    projectNotesRepository = new InMemoryProjectNotesRepository();
    auditLogRepository = new InMemoryAuditLogRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new ChangeProjectStatusUseCase(
      projectsRepository,
      projectNotesRepository,
      auditLogRepository,
      usersRepository,
    );

    const { getTranslations } = await import("next-intl/server");
    vi.mocked(getTranslations).mockImplementation(() =>
      Promise.resolve((key: string) => key),
    );

    const { findTranslatedStage } = await import("@/mappers/projectStageMapper");
    vi.mocked(findTranslatedStage).mockImplementation((status: string) => ({
      label: status,
      shortLabel: status,
      description: "",
      key: status as never,
      icon: (() => null) as never,
      color: "",
    }));
  });

  it("deve avançar status do projeto na sequência válida", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const updated = await sut.execute({
      projectId: project.id,
      newStatus: "TECH_ANALYSIS",
      userId,
      data: { isRegress: true },
    });

    expect(updated.status).toBe("TECH_ANALYSIS");
    expect(auditLogRepository.items).toHaveLength(1);
    expect(auditLogRepository.items[0].action).toBe("STATUS_CHANGE");
  });

  it("deve permitir transição idempotente para o mesmo status", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0].status = "WAITING_DOWN_PAYMENT";

    const result = await sut.execute({
      projectId: project.id,
      newStatus: "WAITING_DOWN_PAYMENT",
      userId,
      data: { observation: "Contrato assinado." },
    });

    expect(result.status).toBe("WAITING_DOWN_PAYMENT");
    expect(auditLogRepository.items).toHaveLength(0);
    expect(projectNotesRepository.items).toHaveLength(0);
  });

  it("não deve permitir transição inválida de status", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await expect(() =>
      sut.execute({
        projectId: project.id,
        newStatus: "COMPLETED",
        userId,
        data: {},
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("não deve avançar para proposta sem serviços", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "TECH_ANALYSIS",
    };

    await expect(() =>
      sut.execute({
        projectId: project.id,
        newStatus: "PROPOSAL",
        userId,
        data: {},
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve avançar para proposta com serviços selecionados", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const serviceTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "TECH_ANALYSIS",
    };

    const updated = await sut.execute({
      projectId: project.id,
      newStatus: "PROPOSAL",
      userId,
      data: { serviceIds: [serviceTypeId] },
    });

    expect(updated.status).toBe("PROPOSAL");
  });

  it("não deve alterar status de projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        projectId: randomUUID(),
        newStatus: "TECH_ANALYSIS",
        userId: randomUUID(),
        data: {},
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve sincronizar serviços ao avançar para TECH_ANALYSIS", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const oldServiceId = randomUUID();
    const newServiceId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });
    projectsRepository.serviceTypes.push({
      id: oldServiceId,
      organizationId,
      categoryId: randomUUID(),
      name: "Consultoria",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    projectsRepository.serviceTypes.push({
      id: newServiceId,
      organizationId,
      categoryId: randomUUID(),
      name: "Desenvolvimento",
      description: null,
      basePrice: 5000,
      estimatedDays: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.projectServices.push({
      projectId: project.id,
      serviceTypeId: oldServiceId,
    });

    const updated = await sut.execute({
      projectId: project.id,
      newStatus: "TECH_ANALYSIS",
      userId,
      data: { serviceIds: [newServiceId] },
    });

    expect(updated.status).toBe("TECH_ANALYSIS");
    expect(
      projectsRepository.projectServices.some(
        (s) => s.projectId === project.id && s.serviceTypeId === newServiceId,
      ),
    ).toBe(true);
    expect(
      projectsRepository.projectServices.some(
        (s) => s.projectId === project.id && s.serviceTypeId === oldServiceId,
      ),
    ).toBe(false);
    const serviceNote = projectNotesRepository.items.find((note) =>
      note.content.includes("Consultoria"),
    );
    expect(serviceNote).toBeDefined();
  });

  it("deve aceitar transação externa sem abrir nova no prisma", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const externalTx = { id: "external-tx" };

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const { prisma } = await import("@/lib/prisma");

    const updated = await sut.execute(
      {
        projectId: project.id,
        newStatus: "TECH_ANALYSIS",
        userId,
        data: { isRegress: true, observation: "Análise iniciada" },
      },
      externalTx as never,
    );

    expect(updated.status).toBe("TECH_ANALYSIS");
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(
      projectNotesRepository.items.some((n) =>
        n.content.includes("Análise iniciada"),
      ),
    ).toBe(true);
  });

  it("deve permitir regressão para PROPOSAL sem alterar serviços", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const serviceTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "PROPOSAL_GENERATED",
    };
    projectsRepository.projectServices.push({
      projectId: project.id,
      serviceTypeId,
    });

    const updated = await sut.execute({
      projectId: project.id,
      newStatus: "PROPOSAL",
      userId,
      data: {},
    });

    expect(updated.status).toBe("PROPOSAL");
    expect(projectsRepository.projectServices).toHaveLength(1);
  });

  it("deve alterar para ON_HOLD sem exigir dados de transição específicos", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    const updated = await sut.execute({
      projectId: project.id,
      newStatus: "ON_HOLD",
      userId,
      data: { observation: "Aguardando cliente" },
    });

    expect(updated.status).toBe("ON_HOLD");
    expect(
      projectNotesRepository.items.some((n) =>
        n.content.includes("Aguardando cliente"),
      ),
    ).toBe(true);
  });

  it("deve atualizar serviços ao retornar para PROPOSAL com novos ids", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const oldServiceId = randomUUID();
    const newServiceId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });
    projectsRepository.serviceTypes.push({
      id: oldServiceId,
      organizationId,
      categoryId: randomUUID(),
      name: "Design",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    projectsRepository.serviceTypes.push({
      id: newServiceId,
      organizationId,
      categoryId: randomUUID(),
      name: "Dev",
      description: null,
      basePrice: 5000,
      estimatedDays: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "PROPOSAL_GENERATED",
    };
    projectsRepository.projectServices.push({
      projectId: project.id,
      serviceTypeId: oldServiceId,
    });

    await sut.execute({
      projectId: project.id,
      newStatus: "PROPOSAL",
      userId,
      data: { serviceIds: [newServiceId] },
    });

    expect(
      projectsRepository.projectServices.some(
        (s) => s.serviceTypeId === newServiceId,
      ),
    ).toBe(true);
    expect(
      projectsRepository.projectServices.some(
        (s) => s.serviceTypeId === oldServiceId,
      ),
    ).toBe(false);
  });

  it("deve incluir diff de serviços na nota ao avançar para PROPOSAL", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const oldServiceId = randomUUID();
    const newServiceId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });
    projectsRepository.serviceTypes.push({
      id: oldServiceId,
      organizationId,
      categoryId: randomUUID(),
      name: "Design",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    projectsRepository.serviceTypes.push({
      id: newServiceId,
      organizationId,
      categoryId: randomUUID(),
      name: "Desenvolvimento Web",
      description: null,
      basePrice: 5000,
      estimatedDays: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "TECH_ANALYSIS",
    };
    projectsRepository.projectServices.push({
      projectId: project.id,
      serviceTypeId: oldServiceId,
    });

    await sut.execute({
      projectId: project.id,
      newStatus: "PROPOSAL",
      userId,
      data: { serviceIds: [newServiceId] },
    });

    expect(
      projectNotesRepository.items.some((n) =>
        n.content.includes("Alteração de serviços"),
      ),
    ).toBe(true);
  });

  it("deve avançar para TECH_ANALYSIS sem diff quando serviços são iguais", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const serviceTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });
    projectsRepository.serviceTypes.push({
      id: serviceTypeId,
      organizationId,
      categoryId: randomUUID(),
      name: "Consultoria",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "DRAFT",
    };
    projectsRepository.projectServices.push({
      projectId: project.id,
      serviceTypeId,
    });

    await sut.execute({
      projectId: project.id,
      newStatus: "TECH_ANALYSIS",
      userId,
      data: { serviceIds: [serviceTypeId] },
    });

    const serviceNote = projectNotesRepository.items.find((note) =>
      note.content.includes("Consultoria"),
    );
    expect(serviceNote).toBeUndefined();
  });

  it("deve usar labels de status crus quando tradução não existir", async () => {
    const { findTranslatedStage } = await import("@/mappers/projectStageMapper");
    const { getTranslations } = await import("next-intl/server");
    vi.mocked(findTranslatedStage).mockReturnValue(undefined);
    vi.mocked(getTranslations).mockImplementation((namespace: string) => {
      if (namespace === "projects.overview.timeline") {
        return Promise.resolve(
          (_key: string, values?: Record<string, string | number>) =>
            `${values?.from}->${values?.to}`,
        );
      }
      return Promise.resolve((key: string) => key);
    });

    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await sut.execute({
      projectId: project.id,
      newStatus: "TECH_ANALYSIS",
      userId,
      data: { isRegress: true, observation: "Início da análise" },
    });

    const note = projectNotesRepository.items[0]?.content ?? "";
    expect(note).toContain("DRAFT->TECH_ANALYSIS");
    expect(note).toContain("Início da análise");
  });

  it("não deve criar nota quando não houver observação nem diff contextual", async () => {
    const { getTranslations } = await import("next-intl/server");
    vi.mocked(getTranslations).mockImplementation((namespace: string) => {
      if (namespace === "projects.overview.timeline") {
        return Promise.resolve(() => "");
      }
      return Promise.resolve((key: string) => key);
    });

    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await sut.execute({
      projectId: project.id,
      newStatus: "TECH_ANALYSIS",
      userId,
      data: { isRegress: true },
    });

    expect(projectNotesRepository.items).toHaveLength(0);
    expect(auditLogRepository.items[0].metadata?.relatedNoteId).toBeNull();
  });

  it("deve tratar projeto sem serviços vinculados ao sincronizar TECH_ANALYSIS", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const serviceTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });
    projectsRepository.serviceTypes.push({
      id: serviceTypeId,
      organizationId,
      categoryId: randomUUID(),
      name: "Consultoria",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      projectServices: undefined as never,
    };

    const updated = await sut.execute({
      projectId: project.id,
      newStatus: "TECH_ANALYSIS",
      userId,
      data: { serviceIds: [serviceTypeId] },
    });

    expect(updated.status).toBe("TECH_ANALYSIS");
    expect(
      projectsRepository.projectServices.some(
        (s) => s.projectId === project.id && s.serviceTypeId === serviceTypeId,
      ),
    ).toBe(true);
  });

  it("não deve incluir diff na nota ao retornar para PROPOSAL com mesmos serviços", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const serviceTypeId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });
    projectsRepository.serviceTypes.push({
      id: serviceTypeId,
      organizationId,
      categoryId: randomUUID(),
      name: "Design",
      description: null,
      basePrice: 1000,
      estimatedDays: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "PROPOSAL_GENERATED",
      projectServices: undefined as never,
    };
    projectsRepository.projectServices.push({
      projectId: project.id,
      serviceTypeId,
    });

    await sut.execute({
      projectId: project.id,
      newStatus: "PROPOSAL",
      userId,
      data: { serviceIds: [serviceTypeId] },
    });

    expect(
      projectNotesRepository.items.some((n) =>
        n.content.includes("Alteração de serviços"),
      ),
    ).toBe(false);
  });

  it("deve enviar DevStartEmail ao avançar para IN_PROGRESS", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    await usersRepository.create({
      organizationId,
      name: "PM Responsável",
      email: "pm@zofia.test",
      role: "USER",
      passwordHash: "hash",
    });

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "PLANNED",
    };

    await sut.execute({
      projectId: project.id,
      newStatus: "IN_PROGRESS",
      userId,
      data: { observation: "Kick-off realizado" },
    });

    expect(sendDevStartEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@acme.test",
        clientName: "Acme",
        projectName: "Projeto Alpha",
      }),
    );
  });

  it("deve enviar HomologationReadyEmail ao avançar para REVIEW", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Beta",
      description: "Desc",
      slug: "projeto-beta",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "IN_PROGRESS",
    };

    await sut.execute({
      projectId: project.id,
      newStatus: "REVIEW",
      userId,
      data: {
        featureName: "Módulo de Relatórios",
        version: "v2.0.0",
      },
    });

    expect(sendHomologationReadyEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@acme.test",
        projectName: "Projeto Beta",
        featureName: "Módulo de Relatórios",
        version: "v2.0.0",
      }),
    );
  });

  it("deve enviar ProjectHandover ao avançar para DELIVERED ou COMPLETED", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
      email: "client@acme.test",
    });

    const project = await projectsRepository.create({
      name: "Projeto Gamma",
      description: "Desc",
      slug: "projeto-gamma",
      clientId,
      createdBy: userId,
      organizationId,
    });

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "REVIEW",
    };

    await sut.execute({
      projectId: project.id,
      newStatus: "DELIVERED",
      userId,
      data: { repoLink: "https://github.com/acme/repo" },
    });

    expect(sendProjectHandover).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@acme.test",
        projectName: "Projeto Gamma",
        repoLink: "https://github.com/acme/repo",
      }),
    );

    vi.mocked(sendProjectHandover).mockClear();

    projectsRepository.items[0] = {
      ...projectsRepository.items[0],
      status: "FINAL_PAYMENT",
    };

    await sut.execute({
      projectId: project.id,
      newStatus: "COMPLETED",
      userId,
      data: {},
    });

    expect(sendProjectHandover).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@acme.test",
        projectName: "Projeto Gamma",
      }),
    );
  });
});
