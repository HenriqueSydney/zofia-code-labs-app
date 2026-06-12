import { randomUUID } from "node:crypto";
import { Prisma, ServiceCategory } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { IServiceCategoryRepository } from "../IServiceCategoryRepository";

export class InMemoryServiceCategoryRepository
  implements IServiceCategoryRepository
{
  public items: ServiceCategory[] = [];

  async create(
    data: Prisma.ServiceCategoryUncheckedCreateInput,
  ): Promise<ServiceCategory> {
    const category: ServiceCategory = {
      id: data.id ?? randomUUID(),
      organizationId: data.organizationId,
      name: data.name,
      description: data.description ?? null,
      taxCode: data.taxCode ?? null,
      deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
    };

    this.items.push(category);
    return category;
  }

  async update(
    id: string,
    data: Partial<Prisma.ServiceCategoryUncheckedCreateInput>,
  ): Promise<ServiceCategory> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ServiceCategory not found");
    }

    const current = this.items[index];

    const updated: ServiceCategory = {
      ...current,
      ...(data.organizationId !== undefined && {
        organizationId: data.organizationId,
      }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.taxCode !== undefined && { taxCode: data.taxCode }),
      ...(data.deletedAt !== undefined && {
        deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
      }),
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

  async list(
    organizationId: string,
    query?: string | null,
  ): Promise<ServiceCategory[]> {
    let result = this.items.filter(
      (item) => item.organizationId === organizationId,
    );

    if (query) {
      const normalizedQuery = query.toLowerCase();

      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          (item.description?.toLowerCase().includes(normalizedQuery) ?? false),
      );
    }

    return result;
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<ServiceCategory | null> {
    return (
      this.items.find(
        (item) => item.id === id && item.organizationId === organizationId,
      ) ?? null
    );
  }

  async findByName(
    name: string,
    organizationId: string,
  ): Promise<ServiceCategory | null> {
    return (
      this.items.find(
        (item) => item.name === name && item.organizationId === organizationId,
      ) ?? null
    );
  }
}
