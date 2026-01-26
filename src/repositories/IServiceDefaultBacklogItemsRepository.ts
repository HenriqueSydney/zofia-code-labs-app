import { Pagination } from "@/@types/Pagination";
import {
  ServiceDefaultBacklogItem,
  BacklogPriority,
} from "@/generated/prisma/client";

// Tipo estendido com as relações necessárias (ServiceType)
export type ServiceDefaultBacklogItemWithDetails = ServiceDefaultBacklogItem & {
  serviceType: {
    id: string;
    name: string;
    // Adicione outros campos do ServiceType se necessário
  };
};

export interface ICreateServiceDefaultBacklogItemDTO {
  title: string;
  description: string;
  serviceTypeId: string;
  organizationId: string;
  priority?: BacklogPriority;
  points?: number;
}

export interface IUpdateServiceDefaultBacklogItemDTO extends Partial<
  Omit<ICreateServiceDefaultBacklogItemDTO, "serviceTypeId" | "organizationId">
> {
  id: string;
}

export interface FindAllServiceDefaultBacklogParams {
  serviceTypeId: string; // Obrigatório: buscamos itens de um tipo de serviço
  organizationId: string; // Obrigatório para segurança multi-tenant
  query?: string; // Busca por texto
  priority?: BacklogPriority | null;
}

export interface IServiceDefaultBacklogItemsRepository {
  create(
    data: ICreateServiceDefaultBacklogItemDTO,
  ): Promise<ServiceDefaultBacklogItemWithDetails>;
  update(
    data: IUpdateServiceDefaultBacklogItemDTO,
  ): Promise<ServiceDefaultBacklogItemWithDetails>;
  findById(id: string): Promise<ServiceDefaultBacklogItemWithDetails | null>;
  findAll(
    params: FindAllServiceDefaultBacklogParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: ServiceDefaultBacklogItemWithDetails[];
  }>;
  delete(id: string): Promise<void>;

  reorderItem(
    itemId: string,
    newPositionIndex: number,
    allSortedIds: string[],
  ): Promise<void>;
}
