import { DocumentInput } from "@/@types/DocumentInput";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { Client } from "@/generated/prisma/client";

export interface ICreateClientDTO {
  companyName: string;
  slug: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  organizationId: string;
  file?: File;
}

export interface IUpdateClientDTO {
  id: string;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  file?: File;
}

export interface ClientWithStats extends Client {
  stats: {
    activeProjects: number;
    totalInContracts: number;
    openInvoices: number;
    tenure: string;
  };
}

export type ClientDashboardStats = {
  activeProjects: number;
  maintenanceProjects: number;
  pendingActions: number; // Blockers do lado do cliente
  overdueInvoices: number;
  nextDeliveryDate: Date | null;
  totalInContracts: number;
  openInvoicesCount: number;
  tenure: string;
};

export type DeliveryEvolutionMetric = {
  month: string;
  planned: number;
  completed: number;
};

export type ProjectPipelineMetric = {
  status: string; // Ex: "Em Andamento", "Negociação"
  count: number;
  color?: string; // Opcional, pode ser decidido no front
};

export type ClientBlockerItem = {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectName: string;
};

export type ClientProjectSummary = {
  id: string;
  name: string;
  status: string;
  deliveryDate: Date | null;
  lastUpdate: Date;
  financialStatus: "PAID" | "PENDING" | "OVERDUE" | "ON_TRACK";
};

export interface IClientsRepository {
  create(data: ICreateClientDTO, document?: DocumentInput): Promise<Client>;
  update(data: IUpdateClientDTO, document?: DocumentInput): Promise<Client>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findBySlug(slug: string): Promise<PrismaToPlain<ClientWithStats> | null>;
  findByCnpj(cnpj: string): Promise<Client | null>;
  fetchClients(
    organizationId: string,
    query?: string | null,
  ): Promise<Client[]>;
  /**
   * Busca apenas os contadores para os Cards do Topo.
   * Rápido e leve.
   */
  getClientStats(slug: string): Promise<ClientDashboardStats | null>;

  /**
   * Busca dados agregados de Sprints/Backlog para o gráfico de linhas.
   * Pode ser mais pesado, ideal para um Suspense boundary separado.
   */
  getDeliveryEvolution(
    slug: string,
    months?: number,
  ): Promise<DeliveryEvolutionMetric[]>;

  /**
   * Busca a distribuição de projetos por status para o gráfico de pizza.
   */
  getProjectPipeline(slug: string): Promise<ProjectPipelineMetric[]>;

  /**
   * Busca itens do backlog que estão bloqueados ou aguardando o cliente.
   */
  getClientBlockers(slug: string): Promise<ClientBlockerItem[]>;
}
