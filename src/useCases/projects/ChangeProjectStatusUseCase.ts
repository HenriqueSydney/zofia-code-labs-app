// src/useCases/projects/ChangeProjectStatusUseCase.ts
import {
  ResourceNotFoundError,
  BusinessRuleError,
  ValidationError,
} from "@/errors";
import {
  sendDevStartEmail,
  sendHomologationReadyEmail,
  sendProjectHandover,
} from "@/email/send";
import {
  IProjectsRepository,
  ProjectWithDetails,
} from "@/repositories/IProjectsRepository";
import { Prisma, ProjectStatus } from "@/generated/prisma/client";
import { validateProjectTransition } from "@/domain/project/ProjectWorkflow";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { isSystemActor } from "@/constants/systemActors";
import { prisma } from "@/lib/prisma";
import { IProjectNotesRepository } from "@/repositories/IProjectNotesRepository";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IUserRepository } from "@/repositories/IUsersRepository";
import { getServicesDiffMessage } from "@/utils/getServicesDiffMessage";
import { findTranslatedStage } from "@/mappers/projectStageMapper";
import { getTranslations } from "next-intl/server";
import {
  buildDefaultDeliveryDate,
  buildDefaultFormattedDate,
  buildDefaultHomologationDeadline,
  buildProjectBoardUrl,
  buildProjectOverviewUrl,
  getClientDisplayName,
  resolveProjectStatusEmailOverrides,
} from "@/lib/project/projectStatusEmailContext";

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
    private usersRepository: IUserRepository,
  ) {}

  async execute(
    { projectId, newStatus, userId, data }: Request,
    tx?: Prisma.TransactionClient,
  ) {
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não localizado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "UPDATE");

    if (project.status === newStatus) {
      return project;
    }

    const isValid = validateProjectTransition(project.status, newStatus);

    if (!isValid) {
      throw new BusinessRuleError(
        `Transição inválida do status ${project.status} para ${newStatus}`,
      );
    }

    const updatedProject = tx
      ? await this.performStatusChange(
          projectId,
          newStatus,
          userId,
          data,
          tx,
          project,
        )
      : await prisma.$transaction(async (newTx) => {
          return this.performStatusChange(
            projectId,
            newStatus,
            userId,
            data,
            newTx,
            project,
          );
        });

    if (project.status !== newStatus) {
      try {
        await this.sendStatusChangeEmails(project, newStatus, userId, data);
      } catch (error) {
        console.error("Erro ao enviar e-mail de mudança de status:", error);
      }
    }

    return updatedProject;
  }

  private async sendStatusChangeEmails(
    project: ProjectWithDetails,
    newStatus: ProjectStatus,
    userId: string,
    data: unknown,
  ) {
    const clientEmail = project.client.email?.trim();

    if (!clientEmail) {
      return;
    }

    const overrides = resolveProjectStatusEmailOverrides(data);
    const clientName = getClientDisplayName(project);
    const operator = await this.usersRepository.findUserById(
      userId,
      project.organizationId,
    );
    const pmName =
      overrides.pmName ?? operator?.name ?? "Equipe Zofia Code Labs";

    switch (newStatus) {
      case "IN_PROGRESS":
        await sendDevStartEmail({
          to: clientEmail,
          clientName,
          projectName: project.name,
          startDate: overrides.startDate ?? buildDefaultFormattedDate(),
          methodology: overrides.methodology ?? "Scrum (Sprints de 15 dias)",
          pmName,
          boardUrl:
            overrides.boardUrl ??
            buildProjectBoardUrl(project.client.slug, project.slug),
        });
        break;

      case "REVIEW":
        await sendHomologationReadyEmail({
          to: clientEmail,
          clientName,
          projectName: project.name,
          featureName:
            overrides.featureName ?? overrides.observation ?? project.name,
          version: overrides.version ?? "v1.0.0",
          homologationUrl:
            overrides.homologationUrl ??
            buildProjectOverviewUrl(project.client.slug, project.slug),
          deadlineDate:
            overrides.deadlineDate ?? buildDefaultHomologationDeadline(),
        });
        break;

      case "DELIVERED":
      case "COMPLETED":
        await sendProjectHandover({
          to: clientEmail,
          clientName,
          projectName: project.name,
          deliveryDate: overrides.deliveryDate ?? buildDefaultDeliveryDate(),
          repoLink:
            overrides.repoLink ??
            buildProjectOverviewUrl(project.client.slug, project.slug),
          docsLink:
            overrides.docsLink ??
            buildProjectOverviewUrl(project.client.slug, project.slug),
          warrantyPeriod: overrides.warrantyPeriod ?? "90 dias",
        });
        break;

      default:
        break;
    }
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

    const tStages = await getTranslations("projects.stages");
    const stageT = (key: string) =>
      tStages(key as Parameters<typeof tStages>[0]);

    const currentStatusLabel =
      findTranslatedStage(project.status, stageT)?.label ?? project.status;
    const newStatusLabel =
      findTranslatedStage(newStatus, stageT)?.label ?? newStatus;

    let header = "";
    if (project.status !== newStatus) {
      header = await getTranslations("projects.overview.timeline").then((t) =>
        t("statusChangeNote", {
          from: currentStatusLabel,
          to: newStatusLabel,
        }),
      );
    }

    let finalObservation = !!header ? `[${header}]` : "";

    if (data?.observation) {
      finalObservation += `: ${data.observation}`;
    }

    if (contextualNote) {
      finalObservation = `${finalObservation}\n\n${contextualNote}`;
    }

    let createdNoteId: string | null = null;
    if (finalObservation && !isSystemActor(userId)) {
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
      const diffMessage = getServicesDiffMessage(
        currentServices,
        data.serviceIds,
      );

      services = data.serviceIds;

      if (hasPreviousServices && diffMessage) {
        finalObservation = diffMessage;
      }
    }

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
    const isAdvancing =
      project.status === "DRAFT" || project.status === "TECH_ANALYSIS";

    const hasServiceIds =
      data?.serviceIds &&
      Array.isArray(data.serviceIds) &&
      data.serviceIds.length > 0;

    if (isAdvancing && !hasServiceIds) {
      throw new ValidationError(
        "Para avançar para Proposta, selecione ao menos um serviço.",
      );
    }

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
