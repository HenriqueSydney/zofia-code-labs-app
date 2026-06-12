import { randomUUID } from "node:crypto";
import { IntegrationType, Prisma } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { IIntegrationTypeRepository } from "../IIntegrationTypeRepository";

export class InMemoryIntegrationTypeRepository
  implements IIntegrationTypeRepository
{
  public items: IntegrationType[] = [];

  async create(
    data: Prisma.IntegrationTypeCreateInput,
  ): Promise<IntegrationType> {
    const integrationType: IntegrationType = {
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      logo: data.logo ?? null,
      enableByol: data.enableByol ?? false,
      description: data.description ?? null,
      externalDocsUrl: data.externalDocsUrl ?? null,
      fieldsSchema: (data.fieldsSchema as IntegrationType["fieldsSchema"]) ?? null,
      deletedAt: null,
    };

    this.items.push(integrationType);
    return integrationType;
  }

  async findById(id: string): Promise<IntegrationType | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<IntegrationType | null> {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async listAll(query?: string): Promise<IntegrationType[]> {
    let result = this.items.filter((item) => item.deletedAt === null);

    if (query) {
      const normalizedQuery = query.toLowerCase();

      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          (item.description?.toLowerCase().includes(normalizedQuery) ?? false),
      );
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(
    id: string,
    data: Prisma.IntegrationTypeUpdateInput,
  ): Promise<IntegrationType> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("IntegrationType not found");
    }

    const current = this.items[index];
    const updates = this.extractScalarUpdates(data);

    const updated: IntegrationType = {
      ...current,
      ...updates,
      id: current.id,
    };

    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    this.items[index] = {
      ...this.items[index],
      deletedAt: date().toDate(),
    };
  }

  private extractScalarUpdates(
    data: Prisma.IntegrationTypeUpdateInput,
  ): Partial<IntegrationType> {
    const updates: Partial<IntegrationType> = {};

    if (typeof data.name === "string") {
      updates.name = data.name;
    }

    if (typeof data.slug === "string") {
      updates.slug = data.slug;
    }

    if (data.logo !== undefined) {
      updates.logo = typeof data.logo === "string" ? data.logo : null;
    }

    if (typeof data.enableByol === "boolean") {
      updates.enableByol = data.enableByol;
    }

    if (data.description !== undefined) {
      updates.description =
        typeof data.description === "string" ? data.description : null;
    }

    if (data.externalDocsUrl !== undefined) {
      updates.externalDocsUrl =
        typeof data.externalDocsUrl === "string" ? data.externalDocsUrl : null;
    }

    if (data.fieldsSchema !== undefined) {
      updates.fieldsSchema =
        data.fieldsSchema as IntegrationType["fieldsSchema"];
    }

    if (data.deletedAt !== undefined) {
      updates.deletedAt =
        data.deletedAt instanceof Date
          ? data.deletedAt
          : typeof data.deletedAt === "string"
            ? new Date(data.deletedAt)
            : null;
    }

    return updates;
  }
}
