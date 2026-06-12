import { randomUUID } from "node:crypto";

import { Prisma, ServiceCategory, ServiceType } from "../../generated/prisma/client";
import { PrismaToPlain } from "../../@types/PrismaToPlain";
import {
  CreateServiceDTO,
  FetchServiceTypeWithCategory,
  IServiceTypeRepository,
} from "../IServiceTypeRepository";

export class InMemoryServiceTypeRepository implements IServiceTypeRepository {
  public items: ServiceType[] = [];
  public categories: ServiceCategory[] = [];

  private withCategory(
    serviceType: ServiceType,
  ): FetchServiceTypeWithCategory | null {
    const category = this.categories.find((c) => c.id === serviceType.categoryId);

    if (!category) {
      return null;
    }

    return {
      ...(serviceType as PrismaToPlain<ServiceType>),
      category,
    };
  }

  private matchesQuery(
    serviceType: ServiceType,
    query: string,
  ): boolean {
    const normalizedQuery = query.toLowerCase();

    if (serviceType.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    if (serviceType.description?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    const category = this.categories.find((c) => c.id === serviceType.categoryId);

    return category?.name.toLowerCase().includes(normalizedQuery) ?? false;
  }

  async create(data: CreateServiceDTO): Promise<PrismaToPlain<ServiceType>> {
    const serviceType: ServiceType = {
      id: randomUUID(),
      organizationId: data.organizationId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description ?? null,
      basePrice:
        data.basePrice != null ? new Prisma.Decimal(data.basePrice) : null,
      active: data.active ?? true,
    };

    this.items.push(serviceType);

    return serviceType as PrismaToPlain<ServiceType>;
  }

  async update(
    id: string,
    data: Partial<CreateServiceDTO>,
  ): Promise<PrismaToPlain<ServiceType>> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ServiceType not found");
    }

    const current = this.items[index];
    const updated: ServiceType = {
      ...current,
      ...data,
      basePrice:
        data.basePrice !== undefined
          ? data.basePrice != null
            ? new Prisma.Decimal(data.basePrice)
            : null
          : current.basePrice,
    };

    this.items[index] = updated;

    return updated as PrismaToPlain<ServiceType>;
  }

  async list(
    organizationId: string,
    query?: string | null,
  ): Promise<FetchServiceTypeWithCategory[]> {
    let filtered = this.items.filter(
      (item) => item.organizationId === organizationId,
    );

    if (query) {
      filtered = filtered.filter((item) => this.matchesQuery(item, query));
    }

    return filtered
      .map((item) => this.withCategory(item))
      .filter((item): item is FetchServiceTypeWithCategory => item !== null);
  }

  async findByName(
    name: string,
    organizationId: string,
  ): Promise<PrismaToPlain<ServiceType> | null> {
    const serviceType = this.items.find(
      (item) => item.name === name && item.organizationId === organizationId,
    );

    return (serviceType as PrismaToPlain<ServiceType>) ?? null;
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<FetchServiceTypeWithCategory | null> {
    const serviceType = this.items.find(
      (item) => item.id === id && item.organizationId === organizationId,
    );

    if (!serviceType) {
      return null;
    }

    return this.withCategory(serviceType);
  }

  async findManyByIds(
    serviceIds: string[],
    organizationId: string,
  ): Promise<PrismaToPlain<ServiceType>[]> {
    return this.items.filter(
      (item) =>
        serviceIds.includes(item.id) && item.organizationId === organizationId,
    ) as PrismaToPlain<ServiceType>[];
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    this.items[index] = {
      ...this.items[index],
      active: false,
    };
  }
}
