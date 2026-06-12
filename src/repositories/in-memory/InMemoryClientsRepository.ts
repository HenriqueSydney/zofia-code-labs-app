import { randomUUID } from "node:crypto";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { DocumentInput } from "@/@types/DocumentInput";
import { Client } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import {
  ClientBlockerItem,
  ClientDashboardStats,
  ClientWithStats,
  DeliveryEvolutionMetric,
  IClientsRepository,
  ICreateClientDTO,
  IUpdateClientDTO,
  ProjectPipelineMetric,
} from "../IClientsRepository";

export class InMemoryClientsRepository implements IClientsRepository {
  public items: Client[] = [];

  async create(
    data: ICreateClientDTO,
    document?: DocumentInput,
  ): Promise<Client> {
    const newClient: Client = {
      id: randomUUID(),
      organizationId: data.organizationId,
      companyName: data.companyName,
      tradeName: data.tradeName,
      slug: data.slug,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone,
      address: null,
      logoReference: document?.url ?? null,
      responsibleName: data.responsibleName ?? null,
      responsibleEmail: data.responsibleEmail ?? null,
      responsiblePhone: data.responsiblePhone ?? null,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      deletedAt: null,
    };

    this.items.push(newClient);
    return newClient;
  }

  async update(
    data: IUpdateClientDTO,
    document?: DocumentInput,
  ): Promise<Client> {
    const index = this.items.findIndex((item) => item.id === data.id);

    if (index === -1) {
      throw new Error("Client not found");
    }

    const current = this.items[index];
    const { id: _id, file: _file, ...updateData } = data;

    const updated: Client = {
      ...current,
      ...updateData,
      logoReference:
        document !== undefined ? (document?.url ?? null) : current.logoReference,
      updatedAt: date().toDate(),
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
      updatedAt: date().toDate(),
    };
  }

  async findById(id: string): Promise<Client | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findBySlug(
    slug: string,
  ): Promise<PrismaToPlain<ClientWithStats> | null> {
    const client = this.items.find((item) => item.slug === slug);

    if (!client) {
      return null;
    }

    return {
      ...client,
      stats: {
        activeProjects: 0,
        totalInContracts: 0,
        openInvoices: 0,
        tenure: date(client.createdAt).fromNow(),
      },
    };
  }

  async findByCnpj(cnpj: string): Promise<Client | null> {
    return this.items.find((item) => item.cnpj === cnpj) ?? null;
  }

  async fetchClients(
    organizationId: string,
    query?: string | null,
  ): Promise<Client[]> {
    let result = this.items.filter(
      (item) => item.organizationId === organizationId,
    );

    if (query) {
      const normalizedQuery = query.toLowerCase();

      result = result.filter(
        (item) =>
          item.companyName.toLowerCase().includes(normalizedQuery) ||
          item.tradeName.toLowerCase().includes(normalizedQuery) ||
          item.cnpj.includes(query) ||
          item.email.toLowerCase().includes(normalizedQuery),
      );
    }

    return result.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getClientStats(slug: string): Promise<ClientDashboardStats | null> {
    const client = this.items.find((item) => item.slug === slug);

    if (!client) {
      return null;
    }

    return {
      activeProjects: 0,
      maintenanceProjects: 0,
      pendingActions: 0,
      overdueInvoices: 0,
      openInvoicesCount: 0,
      nextDeliveryDate: null,
      totalInContracts: 0,
      tenure: date(client.createdAt).fromNow(),
    };
  }

  async getDeliveryEvolution(
    slug: string,
    _months = 6,
  ): Promise<DeliveryEvolutionMetric[]> {
    const client = this.items.find((item) => item.slug === slug);

    if (!client) {
      return [];
    }

    return [];
  }

  async getProjectPipeline(slug: string): Promise<ProjectPipelineMetric[]> {
    const client = this.items.find((item) => item.slug === slug);

    if (!client) {
      return [];
    }

    return [];
  }

  async getClientBlockers(slug: string): Promise<ClientBlockerItem[]> {
    const client = this.items.find((item) => item.slug === slug);

    if (!client) {
      return [];
    }

    return [];
  }
}
