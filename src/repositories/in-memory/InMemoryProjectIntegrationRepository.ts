import { randomUUID } from "node:crypto";
import { Prisma, ProjectIntegration } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import {
  IProjectIntegrationRepository,
  ProjectIntegrationWithDetails,
} from "../IProjectIntegrationRepository";

export class InMemoryProjectIntegrationRepository
  implements IProjectIntegrationRepository
{
  public items: ProjectIntegration[] = [];
  public integrationTypes: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  }[] = [];
  public organizationIntegrations: { id: string; organizationId: string }[] =
    [];
  public projects: { id: string; slug: string }[] = [];

  private toWithDetails(
    item: ProjectIntegration,
  ): ProjectIntegrationWithDetails {
    const integrationType = this.integrationTypes.find(
      (type) => type.id === item.integrationTypeId,
    ) ?? {
      name: "",
      slug: "",
      logo: null,
    };

    const organizationIntegration = this.organizationIntegrations.find(
      (entry) => entry.id === item.organizationIntegrationId,
    ) ?? { organizationId: "" };

    return {
      ...item,
      integrationType,
      organizationIntegration,
    };
  }

  async create(
    data: Prisma.ProjectIntegrationUncheckedCreateInput,
  ): Promise<ProjectIntegration> {
    const now = date().toDate();

    const newItem: ProjectIntegration = {
      id: randomUUID(),
      projectId: data.projectId,
      integrationTypeId: data.integrationTypeId,
      organizationIntegrationId: data.organizationIntegrationId,
      config: (data.config as ProjectIntegration["config"]) ?? null,
      enabled: data.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(newItem);
    return newItem;
  }

  async findById(id: string): Promise<ProjectIntegrationWithDetails | null> {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async findByProjectAndType(
    projectId: string,
    typeId: string,
  ): Promise<ProjectIntegrationWithDetails | null> {
    const item = this.items.find(
      (entry) =>
        entry.projectId === projectId && entry.integrationTypeId === typeId,
    );
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async findByProjectAndSlug(
    projectSlug: string,
    typeSlug: string,
  ): Promise<ProjectIntegrationWithDetails | null> {
    const project = this.projects.find((entry) => entry.slug === projectSlug);
    const integrationType = this.integrationTypes.find(
      (type) => type.slug === typeSlug,
    );
    if (!project || !integrationType) return null;

    const item = this.items.find(
      (entry) =>
        entry.projectId === project.id &&
        entry.integrationTypeId === integrationType.id,
    );
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async listByProject(
    projectId: string,
  ): Promise<ProjectIntegrationWithDetails[]> {
    return this.items
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((item) => this.toWithDetails(item));
  }

  async update(
    id: string,
    data: Prisma.ProjectIntegrationUpdateInput,
  ): Promise<ProjectIntegration> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Project integration not found");
    }

    const current = this.items[index];
    const updates = this.extractScalarUpdates(data);
    const updated: ProjectIntegration = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  private extractScalarUpdates(
    data: Prisma.ProjectIntegrationUpdateInput,
  ): Partial<ProjectIntegration> {
    const updates: Partial<ProjectIntegration> = {};

    if (data.config !== undefined) {
      updates.config = data.config as ProjectIntegration["config"];
    }

    if (typeof data.enabled === "boolean") {
      updates.enabled = data.enabled;
    }

    return updates;
  }
}
