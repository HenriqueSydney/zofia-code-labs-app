import { Pagination } from "@/@types/Pagination";
import {
  BacklogItem,
  BacklogPriority,
  BacklogStatus,
} from "@/generated/prisma/client";

// Tipo estendido com as relações necessárias para o Frontend
export type BacklogItemWithDetails = BacklogItem & {
  assignee?: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl?: string | null;
  } | null;
  sprint?: { id: string; name: string } | null;
  project?: { id: string; name: string };
};

export interface ICreateBacklogItemDTO {
  title: string;
  description: string;
  projectId: string;
  organizationId: string;
  status?: BacklogStatus;
  priority?: BacklogPriority;
  points?: number;
  assigneeId?: string | null;
  sprintId?: string | null;
  externalLink?: string | null;
}

export interface IUpdateBacklogItemDTO extends Partial<
  Omit<ICreateBacklogItemDTO, "projectId">
> {
  id: string;
}

export interface FindAllBacklogParams {
  projectId: string; // Obrigatório: sempre buscamos itens de um projeto
  query?: string; // Busca por texto (título/descrição)
  status?: BacklogStatus | BacklogStatus[] | null; // Pode filtrar por um ou vários status
  priority?: BacklogPriority | null;
  assigneeId?: string | null; // null busca itens "sem dono"
  sprintId?: string | null; // null busca itens do "Backlog" (sem sprint)
}

export interface IBacklogItemsRepository {
  create(data: ICreateBacklogItemDTO): Promise<BacklogItemWithDetails>;
  update(data: IUpdateBacklogItemDTO): Promise<BacklogItemWithDetails>;
  findById(id: string): Promise<BacklogItemWithDetails | null>;
  findAll(
    params: FindAllBacklogParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: BacklogItemWithDetails[];
  }>;
  delete(id: string): Promise<void>;

  // Método utilitário para mover itens (ex: Drag and Drop de status)
  updateStatus(id: string, status: BacklogStatus): Promise<void>;
  cancel(id: string): Promise<void>;
  reorderItem(
    itemId: string,
    newPositionIndex: number,
    allSortedIds: string[],
    status?: BacklogStatus,
  ): Promise<void>;

  syncFromServiceType(
    projectId: string,
    serviceTypeId: string,
    organizationId: string,
  ): Promise<number>;
}
