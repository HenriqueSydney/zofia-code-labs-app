// src/useCases/projects/ChangeProjectStatusUseCase.ts
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";
import { Prisma, ProjectNote, ProjectStatus } from "@/generated/prisma/client";
import { validateProjectTransition } from "@/domain/project/ProjectWorkflow";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IProjectNotesRepository } from "@/repositories/IProjectNotesRepository";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { getServicesDiffMessage } from "@/utils/getServicesDiffMessage";

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
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute({ projectId, newStatus, userId, data }: Request) {
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não localizado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "UPDATE");

    // 2. Validar Transição (State Machine Guard)
    const isValid = validateProjectTransition(project.status, newStatus);

    if (!isValid) {
      throw new Error(
        `Transição inválida do status ${project.status} para ${newStatus}`
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const contextualNote = await this.handleTransitionData(
        project,
        newStatus,
        data,
        tx
      );

      const updatedProject = await this.projectsRepository.updateStatus(
        projectId,
        newStatus,
        tx
      );

      let finalObservation = data?.observation;
      if (contextualNote) {
        finalObservation = `${finalObservation}\n\n${contextualNote}`;
      }

      let createdNoteId: string | null = null;
      if (finalObservation) {
        const observation = await this.projectNotesRepository.create(
          { projectId, userId, content: finalObservation },
          tx
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
            observation: finalObservation ?? "Sem observações",
            relatedNoteId: createdNoteId,
          },
        },
        tx
      );

      return updatedProject;
    });

    return result;
  }

  private async handleTransitionData(
    project: ProjectWithDetails,
    newStatus: ProjectStatus,
    data: any,
    tx: Prisma.TransactionClient
  ) {
    switch (newStatus) {
      case "TECH_ANALYSIS":
        return await this.handleToTechAnalysis(project, data, tx);

      case "PROPOSAL":
        return await this.handleToProposal(project, data, tx);

      case "PROPOSAL_GENERATED":
        // await this.handleToGenerated(projectId, data, tx);
        break;

      // Adicione outros casos conforme necessidade
      default:
        break;
    }
  }

  private async handleToTechAnalysis(
    project: ProjectWithDetails,
    data: any,
    tx: Prisma.TransactionClient
  ) {
    const currentServices =
      project.projectServices.map((service) => ({
        serviceTypeId: service.serviceTypeId,
        serviceType: service.serviceType,
      })) || [];
    const hasPreviousServices = currentServices.length > 0;

    // 1. Calcula o Diff
    const diffMessage = getServicesDiffMessage(
      currentServices,
      data.serviceIds
    );

    let finalObservation = "";
    if (hasPreviousServices && diffMessage) {
      finalObservation = diffMessage;
    }

    // 3. Atualiza no Banco (Sync)
    await this.projectsRepository.updateProjectServices(
      project.id,
      data.serviceIds,
      tx
    );

    return finalObservation;
  }

  private async handleToProposal(
    project: ProjectWithDetails,
    data: any,
    tx: Prisma.TransactionClient
  ) {
    if (!data?.serviceIds || !Array.isArray(data.serviceIds)) {
      throw new Error("Para avançar para Proposta, selecione os serviços.");
    }

    const currentServices =
      project.projectServices.map((service) => ({
        serviceTypeId: service.serviceTypeId,
        serviceType: service.serviceType,
      })) || [];
    const hasPreviousServices = currentServices.length > 0;

    // 1. Calcula o Diff
    const diffMessage = getServicesDiffMessage(
      currentServices,
      data.serviceIds
    );

    let finalObservation = "";
    if (hasPreviousServices && diffMessage) {
      finalObservation = diffMessage;
    }

    // 3. Atualiza no Banco (Sync)
    await this.projectsRepository.updateProjectServices(
      project.id,
      data.serviceIds,
      tx
    );

    return finalObservation;
  }
}
