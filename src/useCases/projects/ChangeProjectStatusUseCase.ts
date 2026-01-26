// src/useCases/projects/ChangeProjectStatusUseCase.ts
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";
import { Prisma, ProjectStatus } from "@/generated/prisma/client";
import { validateProjectTransition } from "@/domain/project/ProjectWorkflow";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IProjectNotesRepository } from "@/repositories/IProjectNotesRepository";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { getServicesDiffMessage } from "@/utils/getServicesDiffMessage";
import { allStages } from "@/mappers/projectStageMapper";

interface Request {
  projectId: string;
  newStatus: ProjectStatus;
  userId: string;
  data: any;
}

export class ChangeProjectStatusUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private projectNotesRepository: IProjectNotesRepository,
    private auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(
    { projectId, newStatus, userId, data }: Request,
    tx?: Prisma.TransactionClient,
  ) {
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não localizado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "UPDATE");

    // 2. Validar Transição (State Machine Guard)
    const isValid = validateProjectTransition(project.status, newStatus);

    if (!isValid) {
      throw new Error(
        `Transição inválida do status ${project.status} para ${newStatus}`,
      );
    }
    if (tx) {
      return this.performStatusChange(
        projectId,
        newStatus,
        userId,
        data,
        tx,
        project,
      );
    }

    // Se não existir, abre uma nova
    return await prisma.$transaction(async (newTx) => {
      return this.performStatusChange(
        projectId,
        newStatus,
        userId,
        data,
        newTx,
        project,
      );
    });
  }

  private async performStatusChange(
    projectId: string,
    newStatus: ProjectStatus,
    userId: string,
    data: any,
    tx: Prisma.TransactionClient,
    project: ProjectWithDetails,
  ) {
    const contextualNote = await this.handleTransitionData(
      project,
      newStatus,
      data,
      tx,
    );

    const updatedProject = await this.projectsRepository.updateStatus(
      projectId,
      newStatus,
      tx,
    );

    const currentStatusLabel =
      allStages.find((s) => s.key === project.status)?.label ?? project.status;
    const newStatusLabel =
      allStages.find((s) => s.key === newStatus)?.label ?? newStatus;

    let header = "";
    if (project.status !== newStatus) {
      header = `Mudança de status de ${currentStatusLabel} para ${newStatusLabel}`;
    }

    let finalObservation = !!header ? `[${header}]` : "";

    if (data?.observation) {
      finalObservation += `: ${data.observation}`;
    }

    if (contextualNote) {
      finalObservation = `${finalObservation}\n\n${contextualNote}`;
    }

    let createdNoteId: string | null = null;
    if (finalObservation) {
      const observation = await this.projectNotesRepository.create(
        { projectId, userId, content: finalObservation },
        tx,
      );
      createdNoteId = observation.id;
    }

    await this.auditLogRepository.create(
      {
        entityType: "Project",
        entityId: projectId,
        action: "STATUS_CHANGE",
        userId,
        changes: { status: { from: project.status, to: newStatus } },
        metadata: {
          ...data,
          observation: finalObservation ?? "Sem observações",
          relatedNoteId: createdNoteId,
        },
      },
      tx,
    );

    return updatedProject;
  }

  private async handleTransitionData(
    project: ProjectWithDetails,
    newStatus: ProjectStatus,
    data: any,
    tx: Prisma.TransactionClient,
  ) {
    switch (newStatus) {
      case "TECH_ANALYSIS":
        return await this.handleToTechAnalysis(project, data, tx);

      case "PROPOSAL":
        return await this.handleToProposal(project, data, tx);

      // Adicione outros casos conforme necessidade
      default:
        break;
    }
  }

  private async handleToTechAnalysis(
    project: ProjectWithDetails,
    data: any,
    tx: Prisma.TransactionClient,
  ) {
    const currentServices =
      project.projectServices.map((service) => ({
        serviceTypeId: service.serviceTypeId,
        serviceType: service.serviceType,
      })) || [];
    const hasPreviousServices = currentServices.length > 0;

    let finalObservation = "";
    let services = currentServices.map((service) => service.serviceTypeId);
    if (!data.isRegress) {
      // 1. Calcula o Diff
      const diffMessage = getServicesDiffMessage(
        currentServices,
        data.serviceIds,
      );

      services = data.serviceIds;

      if (hasPreviousServices && diffMessage) {
        finalObservation = diffMessage;
      }
    }

    // 3. Atualiza no Banco (Sync)
    await this.projectsRepository.updateProjectServices(
      project.id,
      services,
      tx,
    );

    return finalObservation;
  }

  private async handleToProposal(
    project: ProjectWithDetails,
    data: any,
    tx: Prisma.TransactionClient,
  ) {
    // 1. Identificar a direção da transição
    // Consideramos "Avanço" se o status atual for inferior à Proposta (ex: DRAFT, TECH_ANALYSIS)
    const isAdvancing =
      project.status === "DRAFT" || project.status === "TECH_ANALYSIS";

    // 2. Validação condicional
    const hasServiceIds =
      data?.serviceIds &&
      Array.isArray(data.serviceIds) &&
      data.serviceIds.length > 0;

    if (isAdvancing && !hasServiceIds) {
      throw new Error(
        "Para avançar para Proposta, selecione ao menos um serviço.",
      );
    }

    // 3. Só processamos a atualização de serviços se eles forem enviados no 'data'
    // No caso de um retorno, se o 'data.serviceIds' vier vazio, mantemos os atuais.
    if (hasServiceIds) {
      const currentServices =
        project.projectServices.map((service) => ({
          serviceTypeId: service.serviceTypeId,
          serviceType: service.serviceType,
        })) || [];

      const diffMessage = getServicesDiffMessage(
        currentServices,
        data.serviceIds,
      );

      await this.projectsRepository.updateProjectServices(
        project.id,
        data.serviceIds,
        tx,
      );

      return diffMessage ? `Alteração de serviços:\n${diffMessage}` : null;
    }

    return null;
  }
}
