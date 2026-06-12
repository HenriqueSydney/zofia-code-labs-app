import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import type { ProjectStatus, ServiceType } from "@/generated/prisma/client";
import { InMemoryAuditLogRepository } from "@/repositories/in-memory/InMemoryAuditLogRepository";
import { InMemoryProjectNotesRepository } from "@/repositories/in-memory/InMemoryProjectNotesRepository";
import { InMemoryProjectsRepository } from "@/repositories/in-memory/InMemoryProjectsRepository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/InMemoryUsersRepository";
import { ChangeProjectStatusUseCase } from "@/useCases/projects/ChangeProjectStatusUseCase";

export interface ProjectWorkflowContext {
  sut: ChangeProjectStatusUseCase;
  projectsRepository: InMemoryProjectsRepository;
  projectNotesRepository: InMemoryProjectNotesRepository;
  auditLogRepository: InMemoryAuditLogRepository;
  projectId: string;
  userId: string;
  /** Serviço vinculado em DRAFT → TECH_ANALYSIS */
  serviceTypeId: string;
  /** Serviço incluído ao avançar TECH_ANALYSIS → PROPOSAL */
  additionalServiceTypeId: string;
}

export function getHappyPathServiceIds(ctx: ProjectWorkflowContext): string[] {
  return [ctx.serviceTypeId, ctx.additionalServiceTypeId];
}

function createTestServiceType(input: {
  id: string;
  organizationId: string;
  name: string;
  basePrice: number;
}): ServiceType {
  return {
    id: input.id,
    organizationId: input.organizationId,
    categoryId: randomUUID(),
    name: input.name,
    description: null,
    basePrice: new Decimal(input.basePrice),
    active: true,
  };
}

export function createProjectWorkflowContext(): ProjectWorkflowContext {
  const projectsRepository = new InMemoryProjectsRepository();
  const projectNotesRepository = new InMemoryProjectNotesRepository();
  const auditLogRepository = new InMemoryAuditLogRepository();
  const usersRepository = new InMemoryUsersRepository();
  const sut = new ChangeProjectStatusUseCase(
    projectsRepository,
    projectNotesRepository,
    auditLogRepository,
    usersRepository,
  );

  const organizationId = randomUUID();
  const userId = randomUUID();
  const clientId = randomUUID();
  const serviceTypeId = randomUUID();
  const additionalServiceTypeId = randomUUID();

  projectsRepository.clients.push({
    id: clientId,
    companyName: "Acme",
    slug: "acme",
    tradeName: "Acme",
    email: "client@acme.test",
  });

  projectsRepository.serviceTypes.push(
    createTestServiceType({
      id: serviceTypeId,
      organizationId,
      name: "Desenvolvimento",
      basePrice: 5000,
    }),
  );
  projectsRepository.serviceTypes.push(
    createTestServiceType({
      id: additionalServiceTypeId,
      organizationId,
      name: "Consultoria",
      basePrice: 2000,
    }),
  );

  return {
    sut,
    projectsRepository,
    projectNotesRepository,
    auditLogRepository,
    projectId: "",
    userId,
    serviceTypeId,
    additionalServiceTypeId,
  };
}

export async function seedDraftProject(
  ctx: ProjectWorkflowContext,
): Promise<string> {
  const clientId = ctx.projectsRepository.clients[0]!.id;

  const project = await ctx.projectsRepository.create({
    name: "Projeto Workflow",
    description: "Fluxo comercial-operacional",
    slug: "projeto-workflow",
    clientId,
    createdBy: ctx.userId,
    organizationId: ctx.projectsRepository.serviceTypes[0]!.organizationId,
  });

  ctx.projectId = project.id;
  return project.id;
}

export function setProjectStatus(
  ctx: ProjectWorkflowContext,
  status: ProjectStatus,
): void {
  const index = ctx.projectsRepository.items.findIndex(
    (p) => p.id === ctx.projectId,
  );
  if (index === -1) return;

  ctx.projectsRepository.items[index] = {
    ...ctx.projectsRepository.items[index]!,
    status,
  };
}

