import { randomUUID } from "node:crypto";
import {
  IntegrationType,
  OrganizationIntegration,
  Prisma,
  ProjectIntegration,
} from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import {
  IOrganizationIntegrationRepository,
  OrganizationIntegrationWithDetails,
} from "../IOrganizationIntegrationRepository";

export class InMemoryOrganizationIntegrationRepository
  implements IOrganizationIntegrationRepository
{
  public items: OrganizationIntegration[] = [];
  public integrationTypes: IntegrationType[] = [];
  public projectIntegrations: ProjectIntegration[] = [];
  public projects: { id: string; slug: string }[] = [];

  private toWithDetails(
    item: OrganizationIntegration,
  ): OrganizationIntegrationWithDetails {
    const integrationType =
      this.integrationTypes.find((type) => type.id === item.integrationTypeId) ??
      ({
        id: item.integrationTypeId,
        name: "",
        slug: "",
        logo: null,
        enableByol: false,
        description: null,
        externalDocsUrl: null,
        fieldsSchema: null,
        deletedAt: null,
      } satisfies IntegrationType);

    const relatedProjectIntegrations = this.projectIntegrations
      .filter(
        (projectIntegration) =>
          projectIntegration.organizationIntegrationId === item.id,
      )
      .map((projectIntegration) => {
        const project = this.projects.find(
          (entry) => entry.id === projectIntegration.projectId,
        );
        return {
          ...projectIntegration,
          project: { slug: project?.slug ?? "" },
        };
      });

    return {
      ...item,
      integrationType,
      projectIntegrations: relatedProjectIntegrations,
    };
  }

  async create(
    data: Prisma.OrganizationIntegrationUncheckedCreateInput,
  ): Promise<OrganizationIntegration> {
    const now = date().toDate();

    const newItem: OrganizationIntegration = {
      id: randomUUID(),
      organizationId: data.organizationId,
      integrationTypeId: data.integrationTypeId,
      enableByol: data.enableByol ?? false,
      lastHealthCheck:
        data.lastHealthCheck instanceof Date
          ? data.lastHealthCheck
          : data.lastHealthCheck
            ? new Date(data.lastHealthCheck)
            : null,
      healthStatus: data.healthStatus ?? null,
      lastError: data.lastError ?? null,
      errorCount: data.errorCount ?? 0,
      enabled: data.enabled ?? true,
      config: (data.config as OrganizationIntegration["config"]) ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(newItem);
    return newItem;
  }

  async findById(
    id: string,
  ): Promise<OrganizationIntegrationWithDetails | null> {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async findByOrgAndType(
    organizationId: string,
    integrationTypeId: string,
  ): Promise<OrganizationIntegrationWithDetails | null> {
    const item = this.items.find(
      (entry) =>
        entry.organizationId === organizationId &&
        entry.integrationTypeId === integrationTypeId,
    );
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async findByOrgAndSlug(
    organizationId: string,
    slug: string,
  ): Promise<OrganizationIntegrationWithDetails | null> {
    const integrationType = this.integrationTypes.find(
      (type) => type.slug === slug,
    );
    if (!integrationType) return null;

    const item = this.items.find(
      (entry) =>
        entry.organizationId === organizationId &&
        entry.integrationTypeId === integrationType.id,
    );
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<OrganizationIntegration[]> {
    return this.items
      .filter((item) => item.organizationId === organizationId)
      .sort((a, b) => {
        const typeA =
          this.integrationTypes.find((type) => type.id === a.integrationTypeId)
            ?.name ?? "";
        const typeB =
          this.integrationTypes.find((type) => type.id === b.integrationTypeId)
            ?.name ?? "";
        return typeA.localeCompare(typeB);
      });
  }

  async update(
    id: string,
    data: Prisma.OrganizationIntegrationUpdateInput,
  ): Promise<OrganizationIntegration> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Organization integration not found");
    }

    const current = this.items[index];
    const updates = this.extractScalarUpdates(data);
    const updated: OrganizationIntegration = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return updated;
  }

  async updateHealthStatus(
    id: string,
    status: "HEALTHY" | "WARNNING" | "ERROR",
    lastError?: string,
  ): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const current = this.items[index];
    this.items[index] = {
      ...current,
      healthStatus: status,
      lastError: lastError ?? null,
      lastHealthCheck: date().toDate(),
      errorCount: status === "ERROR" ? current.errorCount + 1 : 0,
      updatedAt: date().toDate(),
    };
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  private extractScalarUpdates(
    data: Prisma.OrganizationIntegrationUpdateInput,
  ): Partial<OrganizationIntegration> {
    const updates: Partial<OrganizationIntegration> = {};

    if (typeof data.enableByol === "boolean") {
      updates.enableByol = data.enableByol;
    }

    if (data.lastHealthCheck !== undefined) {
      updates.lastHealthCheck =
        data.lastHealthCheck instanceof Date
          ? data.lastHealthCheck
          : data.lastHealthCheck
            ? new Date(data.lastHealthCheck as string)
            : null;
    }

    if (data.healthStatus !== undefined) {
      updates.healthStatus =
        typeof data.healthStatus === "string" ? data.healthStatus : null;
    }

    if (data.lastError !== undefined) {
      updates.lastError =
        typeof data.lastError === "string" ? data.lastError : null;
    }

    if (typeof data.errorCount === "number") {
      updates.errorCount = data.errorCount;
    }

    if (typeof data.enabled === "boolean") {
      updates.enabled = data.enabled;
    }

    if (data.config !== undefined) {
      updates.config = data.config as OrganizationIntegration["config"];
    }

    return updates;
  }
}
